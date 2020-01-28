import { ClientSideBaseVisitor, ClientSideBasePluginConfig, LoadedFragment, getConfigValue, OMIT_TYPE, indentMultiline, RawClientSideBasePluginConfig, DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { GraphQLSchema, Kind } from 'graphql';
import { OperationDefinitionNode } from 'graphql';
import { RawGraphQLRequestPluginConfig } from './config';

export interface GraphQLRequestPluginConfig extends ClientSideBasePluginConfig {
  rawRequest: boolean;
}

export class GraphQLRequestVisitor extends ClientSideBaseVisitor<RawGraphQLRequestPluginConfig, GraphQLRequestPluginConfig> {
  private _operationsToInclude: { node: OperationDefinitionNode; documentVariableName: string; operationType: string; operationResultType: string; operationVariablesTypes: string }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: RawGraphQLRequestPluginConfig) {
    super(schema, fragments, rawConfig, {
      rawRequest: getConfigValue(rawConfig.rawRequest, false),
    });

    autoBind(this);

    this._additionalImports.push(`import { GraphQLClient } from 'graphql-request';`);

    if (this.config.documentMode !== DocumentMode.string) {
      this._additionalImports.push(`import { print } from 'graphql';`);
    }

    if (this.config.rawRequest) {
      this._additionalImports.push(`import { GraphQLError } from 'graphql-request/dist/src/types';`);
    }
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
    });

    return null;
  }

  public get sdkContent(): string {
    const allPossibleActions = this._operationsToInclude
      .map(o => {
        const optionalVariables = !o.node.variableDefinitions || o.node.variableDefinitions.length === 0 || o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue);
        const doc = this.config.documentMode === DocumentMode.string ? o.documentVariableName : `print(${o.documentVariableName})`;
        if (this.config.rawRequest) {
          return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${o.operationVariablesTypes}): Promise<{ data?: ${
            o.operationResultType
          } | undefined; extensions?: any; headers: Headers; status: number; errors?: GraphQLError[] | undefined; }> {
    return client.rawRequest<${o.operationResultType}>(${doc}, variables);
}`;
        } else {
          return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${o.operationVariablesTypes}): Promise<${o.operationResultType}> {
  return client.request<${o.operationResultType}>(${doc}, variables);
}`;
        }
      })
      .map(s => indentMultiline(s, 2));

    return `export function getSdk(client: GraphQLClient) {
  return {
${allPossibleActions.join(',\n')}
  };
}`;
  }
}
