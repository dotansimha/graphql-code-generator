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
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
    this.visitor.imports.add(`import { GraphQLClient } from 'graphql-request';`);
    const hookConfig = this.visitor.getReactQueryHooksMap();
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.query.hook);
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.query.options);

    return `export const use${operationName} = (client: GraphQLClient, ${variables}, options?: ${hookConfig.query.options}<${operationResultType}>) => 
  useQuery<${operationResultType}>(
    ['${node.name.value}', variables],
    fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables),
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
    this.visitor.imports.add(`import { GraphQLClient } from 'graphql-request';`);

    const hookConfig = this.visitor.getReactQueryHooksMap();
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.mutation.hook);
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.mutation.options);

    return `export const use${operationName} = (client: GraphQLClient, options?: ${hookConfig.mutation.options}<${operationResultType}, unknown, ${operationVariablesTypes}>) => 
  useMutation<${operationResultType}, unknown, ${operationVariablesTypes}>(
    (${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables)(),
    options
  );`;
  }
}
