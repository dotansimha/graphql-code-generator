import { OperationDefinitionNode } from 'graphql';
import { ReactQueryVisitor } from './visitor';
import { FetcherRenderer } from './fetcher';
import { generateKey, generateVariablesSignature } from './variables-generator';

export class GraphQLRequestClientFetcher implements FetcherRenderer {
  constructor(private visitor: ReactQueryVisitor) {}

  generateFetcherImplementaion(): string {
    return `
function fetcher<TData, TVariables>(client: GraphQLClient, query: string, variables?: TVariables, headers?: RequestInit['headers']) {
  return async (): Promise<TData> => client.request<TData, TVariables>(query, variables, headers);
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
    const variables = generateVariablesSignature(hasRequiredVariables, operationVariablesTypes);

    const typeImport = this.visitor.config.useTypeImports ? 'import type' : 'import';
    this.visitor.imports.add(`${typeImport} { GraphQLClient } from 'graphql-request';`);
    this.visitor.imports.add(`${typeImport} { RequestInit } from 'graphql-request/dist/types.dom';`);

    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.query.hook);
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.query.options);

    const options = `options?: ${hookConfig.query.options}<${operationResultType}, TError, TData>`;

    return `export const use${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      client: GraphQLClient,
      ${variables},
      ${options},
      headers?: RequestInit['headers']
    ) =>
    ${hookConfig.query.hook}<${operationResultType}, TError, TData>(
      ${generateKey(node, hasRequiredVariables)},
      fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables, headers),
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
    this.visitor.imports.add(`import { GraphQLClient } from 'graphql-request';`);

    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.mutation.hook);
    this.visitor.reactQueryIdentifiersInUse.add(hookConfig.mutation.options);

    const options = `options?: ${hookConfig.mutation.options}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>`;

    return `export const use${operationName} = <
      TError = ${this.visitor.config.errorType},
      TContext = unknown
    >(
      client: GraphQLClient,
      ${options},
      headers?: RequestInit['headers']
    ) =>
    ${hookConfig.mutation.hook}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${generateKey(node, hasRequiredVariables)},
      (${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables, headers)(),
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
    const variables = generateVariablesSignature(hasRequiredVariables, operationVariablesTypes);

    return `\nuse${operationName}.fetcher = (client: GraphQLClient, ${variables}, headers?: RequestInit['headers']) => fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables, headers);`;
  }
}
