import { OperationDefinitionNode } from 'graphql';
import { ReactQueryVisitor } from './visitor';
import { FetcherRenderer } from './fetcher';

export class FetchFetcher implements FetcherRenderer {
  constructor(private visitor: ReactQueryVisitor) {}

  generateFetcherImplementaion(): string {
    return `
function fetcher<TData, TVariables>(endpoint: string, requestInit: RequestInit, query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      ...requestInit,
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  }
}`;
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

    return `export const use${operationName} = <
      TData = ${operationResultType},
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit }, 
      ${variables}, 
      ${options}
    ) => 
    useQuery<${operationResultType}, TError, TData>(
      ['${node.name.value}', variables],
      fetcher<${operationResultType}, ${operationVariablesTypes}>(dataSource.endpoint, dataSource.fetchParams || {}, ${documentVariableName}, variables),
      options
    );`;
  }

  generateMutationHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const variables = `variables?: ${operationVariablesTypes}`;
    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.mutation.hook);
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.mutation.options);

    const options = `options?: ${hookConfig.mutation.options}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>`;

    return `export const use${operationName} = <
      TError = unknown,
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit }, 
      ${options}
    ) => 
    useMutation<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      (${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(dataSource.endpoint, dataSource.fetchParams || {}, ${documentVariableName}, variables)(),
      options
    );`;
  }
}
