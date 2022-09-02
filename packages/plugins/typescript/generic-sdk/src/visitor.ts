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
import { RawGenericSdkPluginConfig } from './config.js';

export interface GenericSdkPluginConfig extends ClientSideBasePluginConfig {
  usingObservableFrom: string;
  rawRequest: boolean;
}

function isStreamOperation(operationAST: OperationDefinitionNode) {
  if (operationAST.operation === 'subscription') {
    return true;
  }
  if (
    operationAST.operation === 'query' &&
    operationAST.directives?.some(directiveNode => directiveNode.name.value === 'live')
  ) {
    return true;
  }
  return false;
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
    const importType = this.config.useTypeImports ? 'import type' : 'import';
    if (this.config.documentMode !== DocumentMode.string) {
      this._additionalImports.push(
        `${importType} { DocumentNode${this.config.rawRequest ? ', ExecutionResult' : ''} } from 'graphql';`
      );
    } else if (this.config.rawRequest) {
      this._additionalImports.push(`${importType} { ExecutionResult } from 'graphql';`);
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
        const returnType = isStreamOperation(o.node) ? (usingObservable ? 'Observable' : 'AsyncIterable') : 'Promise';
        const resultData = this.config.rawRequest
          ? `ExecutionResult<${o.operationResultType}, E>`
          : o.operationResultType;
        return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${
          o.operationVariablesTypes
        }, options?: C): ${returnType}<${resultData}> {
  return requester<${o.operationResultType}, ${o.operationVariablesTypes}>(${
          o.documentVariableName
        }, variables, options) as ${returnType}<${resultData}>;
}`;
      })
      .map(s => indentMultiline(s, 2));

    const documentNodeType = this.config.documentMode === DocumentMode.string ? 'string' : 'DocumentNode';
    const resultData = this.config.rawRequest ? 'ExecutionResult<R, E>' : 'R';
    const requesterTypeName = this.config.rawRequest ? 'Requester<C = {}, E = unknown>' : 'Requester<C = {}>';
    const requesterReturnType = `Promise<${resultData}> | ${
      usingObservable ? 'Observable' : 'AsyncIterable'
    }<${resultData}>`;
    const getSdkSignature = this.config.rawRequest
      ? 'getSdk<C, E>(requester: Requester<C, E>)'
      : 'getSdk<C>(requester: Requester<C>)';

    return `export type ${requesterTypeName} = <R, V>(doc: ${documentNodeType}, vars?: V, options?: C) => ${requesterReturnType}
export function ${getSdkSignature} {
  return {
${allPossibleActions.join(',\n')}
  };
}
export type Sdk = ReturnType<typeof getSdk>;`;
  }
}
