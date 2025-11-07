import { ExecutionResult } from 'graphql';
import { useQuery } from '@tanstack/react-query';
import { TypedDocumentString } from './gql/graphql';

export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  return useQuery(
    [
      // This logic can be customized as desired
      document,
      variables,
    ] as const,
    async ({ queryKey }) => {
      return fetch('https://graphql.org/graphql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryKey[0].toString(),
          variables: queryKey[1],
        }),
      }).then(response => response.json()) as Promise<ExecutionResult<TResult>>;
    }
  );
}
