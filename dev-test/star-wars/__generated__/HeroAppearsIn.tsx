import * as Types from '../types.d.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type HeroAppearsInQueryVariables = Types.Exact<{ [key: string]: never }>;

export type HeroAppearsInQuery = {
  __typename?: 'Query';
  hero?:
    | { __typename?: 'Droid'; name: string; appearsIn: Array<Types.Episode | null> }
    | { __typename?: 'Human'; name: string; appearsIn: Array<Types.Episode | null> }
    | null;
};

export const HeroAppearsInDocument = gql`
  query HeroAppearsIn {
    hero {
      name
      appearsIn
    }
  }
`;

/**
 * __useHeroAppearsInQuery__
 *
 * To run a query within a React component, call `useHeroAppearsInQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroAppearsInQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroAppearsInQuery({
 *   variables: {
 *   },
 * });
 */
export function useHeroAppearsInQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroAppearsInQuery, HeroAppearsInQueryVariables>(HeroAppearsInDocument, options);
}
export function useHeroAppearsInLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroAppearsInQuery, HeroAppearsInQueryVariables>(HeroAppearsInDocument, options);
}
export type HeroAppearsInQueryHookResult = ReturnType<typeof useHeroAppearsInQuery>;
export type HeroAppearsInLazyQueryHookResult = ReturnType<typeof useHeroAppearsInLazyQuery>;
export type HeroAppearsInQueryResult = Apollo.QueryResult<HeroAppearsInQuery, HeroAppearsInQueryVariables>;
