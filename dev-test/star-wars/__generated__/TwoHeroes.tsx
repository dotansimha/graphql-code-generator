import * as Types from '../types.d';

import * as Apollo from '@apollo/client';

export type TwoHeroesQueryVariables = Types.Exact<{ [key: string]: never }>;

export type TwoHeroesQuery = { __typename?: 'Query' } & {
  r2?: Types.Maybe<
    ({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
  >;
  luke?: Types.Maybe<
    ({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
  >;
};

export const TwoHeroesDocument = Apollo.gql`
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
  return Apollo.useQuery<TwoHeroesQuery, TwoHeroesQueryVariables>(TwoHeroesDocument, baseOptions);
}
export function useTwoHeroesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<TwoHeroesQuery, TwoHeroesQueryVariables>
) {
  return Apollo.useLazyQuery<TwoHeroesQuery, TwoHeroesQueryVariables>(TwoHeroesDocument, baseOptions);
}
export type TwoHeroesQueryHookResult = ReturnType<typeof useTwoHeroesQuery>;
export type TwoHeroesLazyQueryHookResult = ReturnType<typeof useTwoHeroesLazyQuery>;
export type TwoHeroesQueryResult = Apollo.QueryResult<TwoHeroesQuery, TwoHeroesQueryVariables>;
