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
    const hookConfig = this.visitor.getReactQueryHooksMap();
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.query.hook);
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.query.options);

    return `export const use${operationName} = (dataSource: { endpoint: string, fetchParams?: RequestInit }, ${variables}, options?: ${hookConfig.query.options}<${operationResultType}>) => 
  useQuery<${operationResultType}>(
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
    const hookConfig = this.visitor.getReactQueryHooksMap();
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.mutation.hook);
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.mutation.options);

    return `export const use${operationName} = (dataSource: { endpoint: string, fetchParams?: RequestInit }, options?: ${hookConfig.mutation.options}<${operationResultType}, unknown, ${operationVariablesTypes}>) => 
  useMutation<${operationResultType}, unknown, ${operationVariablesTypes}>(
    (${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(dataSource.endpoint, dataSource.fetchParams || {}, ${documentVariableName}, variables)(),
    options
  );`;
  }
}
