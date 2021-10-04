import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  indentMultiline,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { GraphQLSchema, Kind, OperationDefinitionNode, print } from 'graphql';
import { RawJitSdkPluginConfig } from './config';

export interface JitSdkPluginConfig extends ClientSideBasePluginConfig {}

export class JitSdkVisitor extends ClientSideBaseVisitor<RawJitSdkPluginConfig, JitSdkPluginConfig> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
  }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: RawJitSdkPluginConfig) {
    super(schema, fragments, rawConfig, {});

    autoBind(this);

    const importType = this.config.useTypeImports ? 'import type' : 'import';
    this._additionalImports.push(`${importType} { GraphQLSchema, ExecutionResult } from 'graphql';`);
    if (this.config.documentMode !== DocumentMode.string && this.config.documentMode !== DocumentMode.graphQLTag) {
      this._additionalImports.push(`${importType} { DocumentNode } from 'graphql';`);
    }
    if (this.config.documentMode === DocumentMode.string) {
      this._additionalImports.push(`import { parse } from 'graphql';`);
    }
    this._additionalImports.push(`import { compileQuery, isCompiledQuery } from 'graphql-jit';`);
    this._additionalImports.push(`import { isAsyncIterable, mapAsyncIterator } from '@graphql-tools/utils';`);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    if (node.name == null) {
      throw new Error("Plugin 'Jit-sdk' cannot generate SDK for unnamed operation.\n\n" + print(node));
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
    const compiledQueries: string[] = [];
    const sdkMethods: string[] = [];
    for (const o of this._operationsToInclude) {
      const operationName = o.node.name.value;
      const compiledQueryVariableName = `${operationName}Compiled`;
      compiledQueries.push(
        indentMultiline(
          `const ${compiledQueryVariableName} = compileQuery(schema, ${
            this.config.documentMode === DocumentMode.string
              ? `parse(${o.documentVariableName})`
              : o.documentVariableName
          }, '${operationName}');
      if(!(isCompiledQuery(${compiledQueryVariableName}))) {
        throw new AggregateError('Failed to compile ${operationName}: ' + ${compiledQueryVariableName}?.errors?.join('\\n'), ${compiledQueryVariableName}?.errors);
      }
      `,
          2
        )
      );

      const optionalVariables =
        !o.node.variableDefinitions ||
        o.node.variableDefinitions.length === 0 ||
        o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue);
      const methodName = o.operationType === 'Subscription' ? 'subscribe!' : 'query';
      const handlerName = o.operationType === 'Subscription' ? 'handleSubscriptionResult' : 'handleExecutionResult';
      const returnType =
        o.operationType === 'Subscription'
          ? `AsyncIterableIterator<${o.operationResultType}> | ${o.operationResultType}`
          : o.operationResultType;
      sdkMethods.push(
        indentMultiline(
          `async ${operationName}(variables${optionalVariables ? '?' : ''}: ${
            o.operationVariablesTypes
          }, context?: C, root?: R): Promise<${returnType}> {
        const result = await ${compiledQueryVariableName}.${methodName}(root, context, variables);
        return ${handlerName}(result, '${operationName}');
    }`,
          2
        )
      );
    }

    return `async function handleSubscriptionResult<T>(resultIterator: AsyncIterableIterator<ExecutionResult> | ExecutionResult, operationName: string) {
      if (isAsyncIterable(resultIterator)) {
        return mapAsyncIterator<any, T>(resultIterator, result => handleExecutionResult(result, operationName));
      } else {
        return handleExecutionResult<T>(resultIterator, operationName);
      }
    }
    function handleExecutionResult<T>(result: ExecutionResult, operationName: string) {
      if (result.errors) {
        throw new AggregateError(\`Failed to execute \${operationName}: \${result.errors.join('\\n')}\`, result.errors);
      }
      return result.data as T;
    }
    export function getJitSdk<C = any, R = any>(schema: GraphQLSchema) {
${compiledQueries.join('\n')}
  return {
${sdkMethods.join(',\n')}
  };
}
export type JitSdk = ReturnType<typeof getJitSdk>;`;
  }
}
