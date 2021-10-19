import { OperationDefinitionNode } from 'graphql';
import { ReactQueryVisitor } from './visitor';
import { FetcherRenderer } from './fetcher';
import { parseMapper, ParsedMapper, buildMapperImport } from '@graphql-codegen/visitor-plugin-common';
import { CustomFetch } from './config';
import { generateMutationKey, generateQueryKey } from './variables-generator';

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
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.query.hook);
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.query.options);

    const options = `options?: ${hookConfig.query.options}<${operationResultType}, TError, TData>`;

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const impl = this._isReactHook
      ? `${typedFetcher}(${documentVariableName}).bind(null, variables)`
      : `${typedFetcher}(${documentVariableName}, variables)`;

    return `export const use${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      ${variables},
      ${options}
    ) =>
    ${hookConfig.query.hook}<${operationResultType}, TError, TData>(
      ${generateQueryKey(node, hasRequiredVariables)},
      ${impl},
      options
    );`;
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
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.mutation.hook);
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.mutation.options);

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
    // We can't generate a fetcher field since we can't call react hooks outside of a React Fucntion Component
    // Related: https://reactjs.org/docs/hooks-rules.html
    if (this._isReactHook) return '';

    const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const impl = `${typedFetcher}(${documentVariableName}, variables)`;

    return `\nuse${operationName}.fetcher = (${variables}) => ${impl};`;
  }
}
