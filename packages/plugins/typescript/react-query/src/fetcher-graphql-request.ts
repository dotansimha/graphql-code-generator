import { OperationDefinitionNode } from 'graphql';
import { ReactQueryVisitor } from './visitor';
import { FetcherRenderer } from './fetcher';

export class GraphQLRequestClientFetcher implements FetcherRenderer {
  constructor(private visitor: ReactQueryVisitor) {}

  generateFetcherImplementaion(): string {
    return `
function fetcher<TData, TVariables>(client: GraphQLClient, query: string, variables?: TVariables) {
  return async (): Promise<TData> => client.request<TData, TVariables>(query, variables);
}`;
  }

  generateQueryHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
    this.visitor.imports.add(`import { GraphQLClient } from 'graphql-request';`);
    this.visitor.reactQueryIdentifiersInUse.add('useQuery');
    this.visitor.reactQueryIdentifiersInUse.add('QueryConfig');

    return `export const use${operationResultType} = (client: GraphQLClient, ${variables}, options?: QueryConfig<${operationResultType}>) => 
  useQuery<${operationResultType}>(
    ['${node.name.value}', variables],
    fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables),
    options
  );`;
  }

  generateMutationHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const variables = `variables?: ${operationVariablesTypes}`;
    this.visitor.imports.add(`import { GraphQLClient } from 'graphql-request';`);
    this.visitor.reactQueryIdentifiersInUse.add('useMutation');
    this.visitor.reactQueryIdentifiersInUse.add('MutationConfig');

    return `export const use${operationResultType} = (client: GraphQLClient, ${variables}, options?: MutationConfig<${operationResultType}, unknown, ${operationVariablesTypes}>) => 
  useMutation<${operationResultType}, unknown, ${operationVariablesTypes}>(
    fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables),
    options
  );`;
  }
}
