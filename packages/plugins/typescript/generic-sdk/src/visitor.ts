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
import { RawGenericSdkPluginConfig } from './config';

export interface GenericSdkPluginConfig extends ClientSideBasePluginConfig {
  usingObservableFrom: string;
  rawRequest: boolean;
}

export class GenericSdkVisitor extends ClientSideBaseVisitor<RawGenericSdkPluginConfig, GenericSdkPluginConfig> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
  }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: RawGenericSdkPluginConfig) {
    super(schema, fragments, rawConfig, {
      usingObservableFrom: rawConfig.usingObservableFrom,
      rawRequest: getConfigValue(rawConfig.rawRequest, false),
    });

    autoBind(this);

    if (this.config.usingObservableFrom) {
      this._additionalImports.push(this.config.usingObservableFrom);
    }
    if (this.config.documentMode !== DocumentMode.string) {
      const importType = this.config.useTypeImports ? 'import type' : 'import';
      this._additionalImports.push(`${importType} { DocumentNode } from 'graphql';`);
    }
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    if (node.name == null) {
      throw new Error("Plugin 'generic-sdk' cannot generate SDK for unnamed operation.\n\n" + print(node));
    } else {
      this._operationsToInclude.push({
        node,
        documentVariableName,
        operationType,
        operationResultType,
        operationVariablesTypes,
      });
    }

    return null;
  }

  public get sdkContent(): string {
    const usingObservable = !!this.config.usingObservableFrom;
    const allPossibleActions = this._operationsToInclude
      .map(o => {
        const optionalVariables =
          !o.node.variableDefinitions ||
          o.node.variableDefinitions.length === 0 ||
          o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue);
        const returnType = usingObservable && o.operationType === 'Subscription' ? 'Observable' : 'Promise';
        const resultData = this.config.rawRequest
          ? `{ data: ${o.operationResultType}, errors: any }`
          : o.operationResultType;
        return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${
          o.operationVariablesTypes
        }, options?: C): ${returnType}<${resultData}> {
  return requester<${o.operationResultType}, ${o.operationVariablesTypes}>(${
          o.documentVariableName
        }, variables, options);
}`;
      })
      .map(s => indentMultiline(s, 2));

    return `export type Requester<C= {}> = <R, V>(doc: ${
      this.config.documentMode === DocumentMode.string ? 'string' : 'DocumentNode'
    }, vars?: V, options?: C) => ${usingObservable ? 'Promise<R> & Observable<R>' : 'Promise<R>'}
export function getSdk<C>(requester: Requester<C>) {
  return {
${allPossibleActions.join(',\n')}
  };
}
export type Sdk = ReturnType<typeof getSdk>;`;
  }
}
