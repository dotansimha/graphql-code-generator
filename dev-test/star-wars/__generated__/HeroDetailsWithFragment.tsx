import * as Types from '../types.d';

import { gql } from '@apollo/client';
import { HeroDetailsFragmentDoc } from './HeroDetailsFragment';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type HeroDetailsWithFragmentQueryVariables = Types.Exact<{
  episode?: Types.InputMaybe<Types.Episode>;
}>;

export type HeroDetailsWithFragmentQuery = {
  __typename?: 'Query';
  hero?:
    | { __typename?: 'Droid'; primaryFunction?: string | null; name: string }
    | { __typename?: 'Human'; height?: number | null; name: string }
    | null;
};

export const HeroDetailsWithFragmentDocument = gql`
  query HeroDetailsWithFragment($episode: Episode) {
    hero(episode: $episode) {
      ...HeroDetails
    }
  }
  ${HeroDetailsFragmentDoc}
`;

/**
 * __useHeroDetailsWithFragmentQuery__
 *
 * To run a query within a React component, call `useHeroDetailsWithFragmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroDetailsWithFragmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroDetailsWithFragmentQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroDetailsWithFragmentQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>(
    HeroDetailsWithFragmentDocument,
    options
  );
}
export function useHeroDetailsWithFragmentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>(
    HeroDetailsWithFragmentDocument,
    options
  );
}
export type HeroDetailsWithFragmentQueryHookResult = ReturnType<typeof useHeroDetailsWithFragmentQuery>;
export type HeroDetailsWithFragmentLazyQueryHookResult = ReturnType<typeof useHeroDetailsWithFragmentLazyQuery>;
export type HeroDetailsWithFragmentQueryResult = Apollo.QueryResult<
  HeroDetailsWithFragmentQuery,
  HeroDetailsWithFragmentQueryVariables
>;
