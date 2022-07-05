import * as Types from '../types.d.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TwoHeroesQueryVariables = Types.Exact<{ [key: string]: never }>;

export type TwoHeroesQuery = {
  __typename?: 'Query';
  r2?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
  luke?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};

export const TwoHeroesDocument = gql`
  query TwoHeroes {
    r2: hero {
      name
    }
    luke: hero(episode: EMPIRE) {
      name
    }
  }
`;

/**
 * __useTwoHeroesQuery__
 *
 * To run a query within a React component, call `useTwoHeroesQuery` and pass it any options that fit your needs.
 * When your component renders, `useTwoHeroesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTwoHeroesQuery({
 *   variables: {
 *   },
 * });
 */
export function useTwoHeroesQuery(baseOptions?: Apollo.QueryHookOptions<TwoHeroesQuery, TwoHeroesQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<TwoHeroesQuery, TwoHeroesQueryVariables>(TwoHeroesDocument, options);
}
export function useTwoHeroesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<TwoHeroesQuery, TwoHeroesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<TwoHeroesQuery, TwoHeroesQueryVariables>(TwoHeroesDocument, options);
}
export type TwoHeroesQueryHookResult = ReturnType<typeof useTwoHeroesQuery>;
export type TwoHeroesLazyQueryHookResult = ReturnType<typeof useTwoHeroesLazyQuery>;
export type TwoHeroesQueryResult = Apollo.QueryResult<TwoHeroesQuery, TwoHeroesQueryVariables>;
