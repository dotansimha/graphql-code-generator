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
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
    this.visitor.reactQueryIdentifiersInUse.add('useQuery');
    this.visitor.reactQueryIdentifiersInUse.add('QueryConfig');

    return `export const use${operationResultType} = (${variables}, options?: QueryConfig<${operationResultType}>) => 
  useQuery<${operationResultType}>(
    ['${node.name.value}', variables],
    fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables),
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
    this.visitor.reactQueryIdentifiersInUse.add('useMutation');
    this.visitor.reactQueryIdentifiersInUse.add('MutationConfig');

    return `export const use${operationResultType} = (${variables}, options?: MutationConfig<${operationResultType}, unknown, ${operationVariablesTypes}>) => 
  useMutation<${operationResultType}, unknown, ${operationVariablesTypes}>(
    fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables),
    options
);`;
  }
}
