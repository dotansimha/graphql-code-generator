import * as Types from '../types.d.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type HeroNameConditionalInclusionQueryVariables = Types.Exact<{
  episode?: Types.InputMaybe<Types.Episode>;
  includeName: Types.Scalars['Boolean'];
}>;

export type HeroNameConditionalInclusionQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name?: string } | { __typename?: 'Human'; name?: string } | null;
};

export type HeroNameConditionalExclusionQueryVariables = Types.Exact<{
  episode?: Types.InputMaybe<Types.Episode>;
  skipName: Types.Scalars['Boolean'];
}>;

export type HeroNameConditionalExclusionQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name?: string } | { __typename?: 'Human'; name?: string } | null;
};

export const HeroNameConditionalInclusionDocument = gql`
  query HeroNameConditionalInclusion($episode: Episode, $includeName: Boolean!) {
    hero(episode: $episode) {
      name @include(if: $includeName)
    }
  }
`;

/**
 * __useHeroNameConditionalInclusionQuery__
 *
 * To run a query within a React component, call `useHeroNameConditionalInclusionQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroNameConditionalInclusionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroNameConditionalInclusionQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *      includeName: // value for 'includeName'
 *   },
 * });
 */
export function useHeroNameConditionalInclusionQuery(
  baseOptions: Apollo.QueryHookOptions<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>(
    HeroNameConditionalInclusionDocument,
    options
  );
}
export function useHeroNameConditionalInclusionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroNameConditionalInclusionQuery,
    HeroNameConditionalInclusionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>(
    HeroNameConditionalInclusionDocument,
    options
  );
}
export type HeroNameConditionalInclusionQueryHookResult = ReturnType<typeof useHeroNameConditionalInclusionQuery>;
export type HeroNameConditionalInclusionLazyQueryHookResult = ReturnType<
  typeof useHeroNameConditionalInclusionLazyQuery
>;
export type HeroNameConditionalInclusionQueryResult = Apollo.QueryResult<
  HeroNameConditionalInclusionQuery,
  HeroNameConditionalInclusionQueryVariables
>;
export const HeroNameConditionalExclusionDocument = gql`
  query HeroNameConditionalExclusion($episode: Episode, $skipName: Boolean!) {
    hero(episode: $episode) {
      name @skip(if: $skipName)
    }
  }
`;

/**
 * __useHeroNameConditionalExclusionQuery__
 *
 * To run a query within a React component, call `useHeroNameConditionalExclusionQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroNameConditionalExclusionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroNameConditionalExclusionQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *      skipName: // value for 'skipName'
 *   },
 * });
 */
export function useHeroNameConditionalExclusionQuery(
  baseOptions: Apollo.QueryHookOptions<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>(
    HeroNameConditionalExclusionDocument,
    options
  );
}
export function useHeroNameConditionalExclusionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroNameConditionalExclusionQuery,
    HeroNameConditionalExclusionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>(
    HeroNameConditionalExclusionDocument,
    options
  );
}
export type HeroNameConditionalExclusionQueryHookResult = ReturnType<typeof useHeroNameConditionalExclusionQuery>;
export type HeroNameConditionalExclusionLazyQueryHookResult = ReturnType<
  typeof useHeroNameConditionalExclusionLazyQuery
>;
export type HeroNameConditionalExclusionQueryResult = Apollo.QueryResult<
  HeroNameConditionalExclusionQuery,
  HeroNameConditionalExclusionQueryVariables
>;
