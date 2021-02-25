import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  getConfigValue,
  indentMultiline,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { GraphQLSchema, Kind, OperationDefinitionNode, print } from 'graphql';
import { RawGraphQLRequestPluginConfig } from './config';

export interface GraphQLRequestPluginConfig extends ClientSideBasePluginConfig {
  rawRequest: boolean;
}

const additionalExportedTypes = `
export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;
`;

export class GraphQLRequestVisitor extends ClientSideBaseVisitor<
  RawGraphQLRequestPluginConfig,
  GraphQLRequestPluginConfig
> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
  }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: RawGraphQLRequestPluginConfig) {
    super(schema, fragments, rawConfig, {
      rawRequest: getConfigValue(rawConfig.rawRequest, false),
    });

    autoBind(this);

    const typeImport = this.config.useTypeImports ? 'import type' : 'import';

    this._additionalImports.push(`${typeImport} { GraphQLClient } from 'graphql-request';`);
    this._additionalImports.push(`${typeImport} * as Dom from 'graphql-request/dist/types.dom';`);

    if (this.config.rawRequest) {
      this._additionalImports.push(`${typeImport} { GraphQLError } from 'graphql-request/dist/types';`);
    }
  }

  public OperationDefinition(node: OperationDefinitionNode) {
    const operationName = node.name?.value;

    if (!operationName) {
      // eslint-disable-next-line no-console
      console.warn(
        `Anonymous GraphQL operation was ignored in "typescript-graphql-request", please make sure to name your operation: `,
        print(node)
      );

      return null;
    }

    return super.OperationDefinition(node);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
    });

    return null;
  }

  private getDocumentNodeVariable(documentVariableName: string): string {
    return this.config.documentMode === DocumentMode.external
      ? `Operations.${documentVariableName}`
      : documentVariableName;
  }

  public get sdkContent(): string {
    const allPossibleActions = this._operationsToInclude
      .map(o => {
        const operationName = o.node.name.value;
        const optionalVariables =
          !o.node.variableDefinitions ||
          o.node.variableDefinitions.length === 0 ||
          o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue);
        const docVarName = this.getDocumentNodeVariable(o.documentVariableName);

        if (this.config.rawRequest) {
          return `${operationName}(variables${optionalVariables ? '?' : ''}: ${
            o.operationVariablesTypes
          }, requestHeaders?: Dom.RequestInit["headers"]): Promise<{ data?: ${
            o.operationResultType
          } | undefined; extensions?: any; headers: Dom.Headers; status: number; errors?: GraphQLError[] | undefined; }> {
    return withWrapper(() => client.rawRequest<${o.operationResultType}>(${docVarName}, variables, requestHeaders));
}`;
        } else {
          return `${operationName}(variables${optionalVariables ? '?' : ''}: ${
            o.operationVariablesTypes
          }, requestHeaders?: Dom.RequestInit["headers"]): Promise<${o.operationResultType}> {
  return withWrapper(() => client.request<${o.operationResultType}>(${docVarName}, variables, requestHeaders));
}`;
        }
      })
      .filter(Boolean)
      .map(s => indentMultiline(s, 2));

    return `${additionalExportedTypes}

const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
${allPossibleActions.join(',\n')}
  };
}
export type Sdk = ReturnType<typeof getSdk>;`;
  }
}
