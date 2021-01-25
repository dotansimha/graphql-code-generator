import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  getConfigValue,
  indentMultiline,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { GraphQLSchema, Kind, OperationDefinitionNode } from 'graphql';
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

    if (this.config.documentMode !== DocumentMode.string) {
      this._additionalImports.push(`import { print } from 'graphql';`);
    }

    if (this.config.rawRequest) {
      this._additionalImports.push(`${typeImport} { GraphQLError } from 'graphql-request/dist/types';`);
      this._additionalImports.push(`${typeImport} { Headers, HeadersInit } from 'graphql-request/dist/types.dom';`);
    } else {
      this._additionalImports.push(`${typeImport} { HeadersInit } from 'graphql-request/dist/types.dom';`);
    }
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
        const optionalVariables =
          !o.node.variableDefinitions ||
          o.node.variableDefinitions.length === 0 ||
          o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue);
        const docVarName = this.getDocumentNodeVariable(o.documentVariableName);
        const doc = this.config.documentMode === DocumentMode.string ? docVarName : `print(${docVarName})`;
        if (this.config.rawRequest) {
          return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${
            o.operationVariablesTypes
          }, requestHeaders?: HeadersInit): Promise<{ data?: ${
            o.operationResultType
          } | undefined; extensions?: any; headers: Headers; status: number; errors?: GraphQLError[] | undefined; }> {
    return withWrapper(() => client.rawRequest<${o.operationResultType}>(${doc}, variables, requestHeaders));
}`;
        } else {
          return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${
            o.operationVariablesTypes
          }, requestHeaders?: HeadersInit): Promise<${o.operationResultType}> {
  return withWrapper(() => client.request<${o.operationResultType}>(${doc}, variables, requestHeaders));
}`;
        }
      })
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
