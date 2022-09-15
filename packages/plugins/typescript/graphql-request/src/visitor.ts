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
import { RawGraphQLRequestPluginConfig } from './config.js';

export interface GraphQLRequestPluginConfig extends ClientSideBasePluginConfig {
  rawRequest: boolean;
  extensionsType: string;
}

const additionalExportedTypes = `
export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;
`;

export class GraphQLRequestVisitor extends ClientSideBaseVisitor<
  RawGraphQLRequestPluginConfig,
  GraphQLRequestPluginConfig
> {
  private _externalImportPrefix: string;
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
      extensionsType: getConfigValue(rawConfig.extensionsType, 'any'),
    });

    autoBind(this);

    const typeImport = this.config.useTypeImports ? 'import type' : 'import';

    this._additionalImports.push(`${typeImport} { GraphQLClient } from 'graphql-request';`);
    this._additionalImports.push(`${typeImport} * as Dom from 'graphql-request/dist/types.dom';`);

    if (this.config.rawRequest && this.config.documentMode !== DocumentMode.string) {
      this._additionalImports.push(`import { print } from 'graphql'`);
    }

    this._externalImportPrefix = this.config.importOperationTypesFrom ? `${this.config.importOperationTypesFrom}.` : '';
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
    operationResultType = this._externalImportPrefix + operationResultType;
    operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;

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
    const extraVariables: string[] = [];
    const allPossibleActions = this._operationsToInclude
      .map(o => {
        const operationType = o.node.operation;
        const operationName = o.node.name.value;
        const optionalVariables =
          !o.node.variableDefinitions ||
          o.node.variableDefinitions.length === 0 ||
          o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue);
        const docVarName = this.getDocumentNodeVariable(o.documentVariableName);

        if (this.config.rawRequest) {
          let docArg = docVarName;
          if (this.config.documentMode !== DocumentMode.string) {
            docArg = `${docVarName}String`;
            extraVariables.push(`const ${docArg} = print(${docVarName});`);
          }
          return `${operationName}(variables${optionalVariables ? '?' : ''}: ${
            o.operationVariablesTypes
          }, signal?: AbortSignal, requestHeaders?: Dom.RequestInit["headers"]): Promise<{ data: ${
            o.operationResultType
          }; extensions?: ${this.config.extensionsType}; headers: Dom.Headers; status: number; }> {
    return withWrapper((wrappedRequestHeaders) => client.rawRequest<${o.operationResultType}>({
        query: ${docArg},
        signal: signal as Dom.RequestInit['signal'],
        variables,
        requestHeaders: {
          ...requestHeaders,
          ...wrappedRequestHeaders,
        },
      }), '${operationName}', '${operationType}');
}`;
        }
        return `${operationName}(variables${optionalVariables ? '?' : ''}: ${
          o.operationVariablesTypes
        }, signal?: AbortSignal, requestHeaders?: Dom.RequestInit["headers"]): Promise<${o.operationResultType}> {
  return withWrapper((wrappedRequestHeaders) => client.request<${o.operationResultType}>({
      document: ${docVarName},
      signal: signal as Dom.RequestInit['signal'],
      variables,
      requestHeaders: {
        ...requestHeaders,
        ...wrappedRequestHeaders,
      },
    }), '${operationName}', '${operationType}');
}`;
      })
      .filter(Boolean)
      .map(s => indentMultiline(s, 2));

    return `${additionalExportedTypes}

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();
${extraVariables.join('\n')}
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
${allPossibleActions.join(',\n')}
  };
}
export type Sdk = ReturnType<typeof getSdk>;`;
  }
}
