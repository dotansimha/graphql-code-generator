import { OperationDefinitionNode } from 'graphql';
import { ReactQueryVisitor } from './visitor';
import { FetcherRenderer } from './fetcher';
import { HardcodedFetch } from './config';
import { URL } from 'url';

export class HardcodedFetchFetcher implements FetcherRenderer {
  constructor(private visitor: ReactQueryVisitor, private config: HardcodedFetch) {}

  private getEndpoint(): string {
    try {
      new URL(this.config.endpoint);

      return JSON.stringify(this.config.endpoint);
    } catch (e) {
      return `${this.config.endpoint} as string`;
    }
  }

  private getFetchParams(): string {
    const fetchParams = {
      method: 'POST',
      ...(this.config.fetchParams || {}),
    };

    return Object.keys(fetchParams)
      .map(key => {
        return `      ${key}: ${JSON.stringify(fetchParams[key])},`;
      })
      .join('\n');
  }

  generateFetcherImplementaion(): string {
    return `
function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch(${this.getEndpoint()}, {
${this.getFetchParams()}
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
      ${variables}, 
      ${options}
    ) => 
    ${hookConfig.query.hook}<${operationResultType}, TError, TData>(
      ['${node.name.value}', variables],
      fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables),
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
    >(${options}) => 
    useMutation<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      (${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables)(),
      options
    );`;
  }
}
