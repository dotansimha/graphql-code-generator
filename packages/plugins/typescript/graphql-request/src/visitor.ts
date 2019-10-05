import { ClientSideBaseVisitor, ClientSideBasePluginConfig, LoadedFragment, getConfigValue, OMIT_TYPE, indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLRequestPluginRawConfig } from './index';
import * as autoBind from 'auto-bind';
import { GraphQLSchema, Kind } from 'graphql';
import { OperationDefinitionNode } from 'graphql';

export interface GraphQLRequestPluginConfig extends ClientSideBasePluginConfig {}

export class GraphQLRequestVisitor extends ClientSideBaseVisitor<GraphQLRequestPluginRawConfig, GraphQLRequestPluginConfig> {
  private _operationsToInclude: { node: OperationDefinitionNode; documentVariableName: string; operationType: string; operationResultType: string; operationVariablesTypes: string }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: GraphQLRequestPluginRawConfig) {
    super(schema, fragments, rawConfig, {});

    autoBind(this);
    this._additionalImports.push(`import { GraphQLClient } from 'graphql-request';`);
    this._additionalImports.push(`import { print } from 'graphql';`);
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

        return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${o.operationVariablesTypes}): Promise<${o.operationResultType}> {
  return client.request<${o.operationResultType}>(print(${o.documentVariableName}), variables);
}`;
      })
      .map(s => indentMultiline(s, 2));

    return `export function getSdk(client: GraphQLClient) {
  return {
${allPossibleActions.join(',\n')}
  };
}`;
  }
}
