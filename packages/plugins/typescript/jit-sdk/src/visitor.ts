import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  indentMultiline,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { GraphQLSchema, Kind, OperationDefinitionNode, print } from 'graphql';
import { RawJitSdkPluginConfig } from './config.js';

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
    this._additionalImports.push(`import { compileQuery, isCompiledQuery, CompilerOptions } from 'graphql-jit';`);
    this._additionalImports.push(
      `import { AggregateError, isAsyncIterable, mapAsyncIterator } from '@graphql-tools/utils';`
    );
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
    let hasSubscription = false;
    for (const o of this._operationsToInclude) {
      const operationName = o.node.name.value;
      const compiledQueryVariableName = `${operationName}Compiled`;
      compiledQueries.push(
        indentMultiline(
          `const ${compiledQueryVariableName} = compileQuery(schema, ${
            this.config.documentMode === DocumentMode.string
              ? `parse(${o.documentVariableName})`
              : o.documentVariableName
          }, '${operationName}', jitOptions);
if(!(isCompiledQuery(${compiledQueryVariableName}))) {
  const originalErrors = ${compiledQueryVariableName}?.errors?.map(error => error.originalError || error) || [];
  throw new AggregateError(originalErrors, \`Failed to compile ${operationName}: \\n\\t\${originalErrors.join('\\n\\t')}\`);
}`,
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
      if (o.operationType === 'Subscription') {
        hasSubscription = true;
      }
      sdkMethods.push(
        indentMultiline(
          `async ${operationName}(variables${optionalVariables ? '?' : ''}: ${
            o.operationVariablesTypes
          }, context?: TOperationContext, root?: TOperationRoot): Promise<${returnType}> {
  const result = await ${compiledQueryVariableName}.${methodName}({
    ...globalRoot,
    ...root
  }, {
    ...globalContext,
    ...context
  }, variables);
  return ${handlerName}(result, '${operationName}');
}`,
          2
        )
      );
    }

    return `${
      hasSubscription
        ? `async function handleSubscriptionResult<T>(resultIterator: AsyncIterableIterator<ExecutionResult> | ExecutionResult, operationName: string) {
  if (isAsyncIterable(resultIterator)) {
    return mapAsyncIterator<any, T>(resultIterator, result => handleExecutionResult(result, operationName));
  } else {
    return handleExecutionResult<T>(resultIterator, operationName);
  }
}
`
        : ``
    }function handleExecutionResult<T>(result: ExecutionResult, operationName: string) {
  if (result.errors) {
    const originalErrors = result.errors.map(error => error.originalError|| error);
    throw new AggregateError(originalErrors, \`Failed to execute \${operationName}: \\n\\t\${originalErrors.join('\\n\\t')}\`);
  }
  return result.data as unknown as T;
}
export interface SdkOptions<TGlobalContext = any, TGlobalRoot = any> {
  globalContext?: TGlobalContext;
  globalRoot?: TGlobalRoot;
  jitOptions?: Partial<CompilerOptions>;
}
export function getSdk<TGlobalContext = any, TGlobalRoot = any, TOperationContext = any, TOperationRoot = any>(schema: GraphQLSchema, { globalContext, globalRoot, jitOptions = {} }: SdkOptions<TGlobalContext, TGlobalRoot> = {}) {
${compiledQueries.join('\n\n')}

  return {
${sdkMethods.join(',\n')}
  };
}
export type Sdk = ReturnType<typeof getSdk>;`;
  }
}
