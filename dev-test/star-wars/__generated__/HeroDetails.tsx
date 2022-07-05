import * as Types from '../types.d.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type HeroDetailsQueryVariables = Types.Exact<{
  episode?: Types.InputMaybe<Types.Episode>;
}>;

export type HeroDetailsQuery = {
  __typename?: 'Query';
  hero?:
    | { __typename?: 'Droid'; primaryFunction?: string | null; name: string }
    | { __typename?: 'Human'; height?: number | null; name: string }
    | null;
};

export const HeroDetailsDocument = gql`
  query HeroDetails($episode: Episode) {
    hero(episode: $episode) {
      name
      ... on Human {
        height
      }
      ... on Droid {
        primaryFunction
      }
    }
  }
`;

/**
 * __useHeroDetailsQuery__
 *
 * To run a query within a React component, call `useHeroDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroDetailsQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroDetailsQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroDetailsQuery, HeroDetailsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroDetailsQuery, HeroDetailsQueryVariables>(HeroDetailsDocument, options);
}
export function useHeroDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroDetailsQuery, HeroDetailsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroDetailsQuery, HeroDetailsQueryVariables>(HeroDetailsDocument, options);
}
export type HeroDetailsQueryHookResult = ReturnType<typeof useHeroDetailsQuery>;
export type HeroDetailsLazyQueryHookResult = ReturnType<typeof useHeroDetailsLazyQuery>;
export type HeroDetailsQueryResult = Apollo.QueryResult<HeroDetailsQuery, HeroDetailsQueryVariables>;
