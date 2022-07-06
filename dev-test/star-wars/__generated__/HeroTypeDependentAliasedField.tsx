import * as Types from '../types.d.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type HeroTypeDependentAliasedFieldQueryVariables = Types.Exact<{
  episode?: Types.InputMaybe<Types.Episode>;
}>;

export type HeroTypeDependentAliasedFieldQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; property?: string | null } | { __typename?: 'Human'; property?: string | null } | null;
};

export const HeroTypeDependentAliasedFieldDocument = gql`
  query HeroTypeDependentAliasedField($episode: Episode) {
    hero(episode: $episode) {
      ... on Human {
        property: homePlanet
      }
      ... on Droid {
        property: primaryFunction
      }
    }
  }
`;

/**
 * __useHeroTypeDependentAliasedFieldQuery__
 *
 * To run a query within a React component, call `useHeroTypeDependentAliasedFieldQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroTypeDependentAliasedFieldQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroTypeDependentAliasedFieldQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroTypeDependentAliasedFieldQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables>(
    HeroTypeDependentAliasedFieldDocument,
    options
  );
}
export function useHeroTypeDependentAliasedFieldLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables>(
    HeroTypeDependentAliasedFieldDocument,
    options
  );
}
export type HeroTypeDependentAliasedFieldQueryHookResult = ReturnType<typeof useHeroTypeDependentAliasedFieldQuery>;
export type HeroTypeDependentAliasedFieldLazyQueryHookResult = ReturnType<
  typeof useHeroTypeDependentAliasedFieldLazyQuery
>;
export type HeroTypeDependentAliasedFieldQueryResult = Apollo.QueryResult<
  HeroTypeDependentAliasedFieldQuery,
  HeroTypeDependentAliasedFieldQueryVariables
>;
