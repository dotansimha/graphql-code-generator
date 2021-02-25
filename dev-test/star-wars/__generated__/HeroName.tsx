import * as Types from '../types.d';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {};
export type HeroNameQueryVariables = Types.Exact<{
  episode?: Types.Maybe<Types.Episode>;
}>;

export type HeroNameQuery = { __typename?: 'Query' } & {
  hero?: Types.Maybe<
    ({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
  >;
};

export const HeroNameDocument = gql`
  query HeroName($episode: Episode) {
    hero(episode: $episode) {
      name
    }
  }
`;

/**
 * __useHeroNameQuery__
 *
 * To run a query within a React component, call `useHeroNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroNameQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroNameQuery(baseOptions?: Apollo.QueryHookOptions<HeroNameQuery, HeroNameQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroNameQuery, HeroNameQueryVariables>(HeroNameDocument, options);
}
export function useHeroNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HeroNameQuery, HeroNameQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroNameQuery, HeroNameQueryVariables>(HeroNameDocument, options);
}
export type HeroNameQueryHookResult = ReturnType<typeof useHeroNameQuery>;
export type HeroNameLazyQueryHookResult = ReturnType<typeof useHeroNameLazyQuery>;
export type HeroNameQueryResult = Apollo.QueryResult<HeroNameQuery, HeroNameQueryVariables>;
