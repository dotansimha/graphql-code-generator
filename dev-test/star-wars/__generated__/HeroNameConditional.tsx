import * as Types from '../types.d';

import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';

export type HeroNameConditionalInclusionQueryVariables = Types.Exact<{
  episode?: Types.Maybe<Types.Episode>;
  includeName: Types.Scalars['Boolean'];
}>;

export type HeroNameConditionalInclusionQuery = { __typename?: 'Query' } & {
  hero?: Types.Maybe<
    ({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
  >;
};

export type HeroNameConditionalExclusionQueryVariables = Types.Exact<{
  episode?: Types.Maybe<Types.Episode>;
  skipName: Types.Scalars['Boolean'];
}>;

export type HeroNameConditionalExclusionQuery = { __typename?: 'Query' } & {
  hero?: Types.Maybe<
    ({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
  >;
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
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    HeroNameConditionalInclusionQuery,
    HeroNameConditionalInclusionQueryVariables
  >
) {
  return ApolloReactHooks.useQuery<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>(
    HeroNameConditionalInclusionDocument,
    baseOptions
  );
}
export function useHeroNameConditionalInclusionLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    HeroNameConditionalInclusionQuery,
    HeroNameConditionalInclusionQueryVariables
  >
) {
  return ApolloReactHooks.useLazyQuery<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>(
    HeroNameConditionalInclusionDocument,
    baseOptions
  );
}
export type HeroNameConditionalInclusionQueryHookResult = ReturnType<typeof useHeroNameConditionalInclusionQuery>;
export type HeroNameConditionalInclusionLazyQueryHookResult = ReturnType<
  typeof useHeroNameConditionalInclusionLazyQuery
>;
export type HeroNameConditionalInclusionQueryResult = ApolloReactCommon.QueryResult<
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
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    HeroNameConditionalExclusionQuery,
    HeroNameConditionalExclusionQueryVariables
  >
) {
  return ApolloReactHooks.useQuery<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>(
    HeroNameConditionalExclusionDocument,
    baseOptions
  );
}
export function useHeroNameConditionalExclusionLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    HeroNameConditionalExclusionQuery,
    HeroNameConditionalExclusionQueryVariables
  >
) {
  return ApolloReactHooks.useLazyQuery<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>(
    HeroNameConditionalExclusionDocument,
    baseOptions
  );
}
export type HeroNameConditionalExclusionQueryHookResult = ReturnType<typeof useHeroNameConditionalExclusionQuery>;
export type HeroNameConditionalExclusionLazyQueryHookResult = ReturnType<
  typeof useHeroNameConditionalExclusionLazyQuery
>;
export type HeroNameConditionalExclusionQueryResult = ApolloReactCommon.QueryResult<
  HeroNameConditionalExclusionQuery,
  HeroNameConditionalExclusionQueryVariables
>;
