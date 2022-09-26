import { ParsedMapper, buildMapperImport, parseMapper } from '@graphql-codegen/visitor-plugin-common';
import { generateInfiniteQueryKey, generateMutationKey, generateQueryKey } from './variables-generator.js';

import { CustomFetch } from './config.js';
import { FetcherRenderer } from './fetcher.js';
import { OperationDefinitionNode } from 'graphql';
import { ReactQueryVisitor } from './visitor.js';

export class CustomMapperFetcher implements FetcherRenderer {
  private _mapper: ParsedMapper;
  private _isReactHook: boolean;

  constructor(private visitor: ReactQueryVisitor, customFetcher: CustomFetch) {
    if (typeof customFetcher === 'string') {
      customFetcher = { func: customFetcher };
    }
    this._mapper = parseMapper(customFetcher.func);
    this._isReactHook = customFetcher.isReactHook;
  }

  private getFetcherFnName(operationResultType: string, operationVariablesTypes: string): string {
    return `${this._mapper.type}<${operationResultType}, ${operationVariablesTypes}>`;
  }

  generateFetcherImplementaion(): string {
    if (this._mapper.isExternal) {
      return buildMapperImport(
        this._mapper.source,
        [
          {
            identifier: this._mapper.type,
            asDefault: this._mapper.default,
          },
        ],
        this.visitor.config.useTypeImports
      );
    }

    return null;
  }

  generateInfiniteQueryHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;

    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.infiniteQuery.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.infiniteQuery.options);

    const options = `options?: ${hookConfig.infiniteQuery.options}<${operationResultType}, TError, TData>`;

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const implHookOuter = this._isReactHook ? `const query = ${typedFetcher}(${documentVariableName})` : '';
    const impl = this._isReactHook
      ? `(props) => query({...variables, ...(props.pageParam ?? {})}, props)`
      : `(props) => ${typedFetcher}(${documentVariableName}, {...variables, ...(props.pageParam ?? {})}, props)()`;

    return `export const useInfinite${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      ${variables},
      ${options}
    ) =>{
    ${implHookOuter}
    return ${hookConfig.infiniteQuery.hook}<${operationResultType}, TError, TData>(
      ${generateInfiniteQueryKey(node, hasRequiredVariables)},
      ${impl},
      options
    )};`;
  }

  generateQueryHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;

    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.query.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.query.options);

    const options = `options?: ${hookConfig.query.options}<${operationResultType}, TError, TData>`;

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const implHookOuter = this._isReactHook ? `const query = ${typedFetcher}(${documentVariableName})` : '';
    const impl = this._isReactHook
      ? `(props) => query(variables, props)`
      : `(props) => ${typedFetcher}(${documentVariableName}, variables, props)()`;

    return `export const use${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      ${variables},
      ${options}
      ) =>{
        ${implHookOuter}
        return ${hookConfig.query.hook}<${operationResultType}, TError, TData>(
          ${generateQueryKey(node, hasRequiredVariables)},
          ${impl},
          options
        )};`;
  }

  generateMutationHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const variables = `variables?: ${operationVariablesTypes}`;
    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.mutation.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.mutation.options);

    const options = `options?: ${hookConfig.mutation.options}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>`;
    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const impl = this._isReactHook
      ? `${typedFetcher}(${documentVariableName})`
      : `(${variables}) => ${typedFetcher}(${documentVariableName}, variables)()`;

    return `export const use${operationName} = <
      TError = ${this.visitor.config.errorType},
      TContext = unknown
    >(${options}) =>
    ${hookConfig.mutation.hook}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${generateMutationKey(node)},
      ${impl},
      options
    );`;
  }

  generateFetcherFetch(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    if (this._isReactHook) {
      const hockImpl = `${typedFetcher}(${documentVariableName}, options)`;
      return `\nexport const use${operationName}Fetcher = (options?: RequestInit['headers']) => ${hockImpl};`;
    }

    const impl = `${typedFetcher}(${documentVariableName}, variables, context, options)`;

    return `\nuse${operationName}.fetcher = (${variables}, options?: RequestInit['headers'], context?: QueryFunctionContext<QueryKey, any>) => ${impl};`;
  }
}
