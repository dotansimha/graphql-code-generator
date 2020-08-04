import * as Types from '../types.d';

import * as Apollo from '@apollo/client';
const gql = Apollo.gql;

export type HeroParentTypeDependentFieldQueryVariables = Types.Exact<{
  episode?: Types.Maybe<Types.Episode>;
}>;

export type HeroParentTypeDependentFieldQuery = { __typename?: 'Query' } & {
  hero?: Types.Maybe<
    | ({ __typename?: 'Human' } & Pick<Types.Human, 'name'> & {
          friends?: Types.Maybe<
            Array<
              Types.Maybe<
                | ({ __typename?: 'Human' } & Pick<Types.Human, 'height' | 'name'>)
                | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
              >
            >
          >;
        })
    | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'> & {
          friends?: Types.Maybe<
            Array<
              Types.Maybe<
                | ({ __typename?: 'Human' } & Pick<Types.Human, 'height' | 'name'>)
                | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
              >
            >
          >;
        })
  >;
};

export const HeroParentTypeDependentFieldDocument = gql`
  query HeroParentTypeDependentField($episode: Episode) {
    hero(episode: $episode) {
      name
      ... on Human {
        friends {
          name
          ... on Human {
            height(unit: FOOT)
          }
        }
      }
      ... on Droid {
        friends {
          name
          ... on Human {
            height(unit: METER)
          }
        }
      }
    }
  }
`;

/**
 * __useHeroParentTypeDependentFieldQuery__
 *
 * To run a query within a React component, call `useHeroParentTypeDependentFieldQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroParentTypeDependentFieldQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroParentTypeDependentFieldQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroParentTypeDependentFieldQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables>
) {
  return Apollo.useQuery<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables>(
    HeroParentTypeDependentFieldDocument,
    baseOptions
  );
}
export function useHeroParentTypeDependentFieldLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroParentTypeDependentFieldQuery,
    HeroParentTypeDependentFieldQueryVariables
  >
) {
  return Apollo.useLazyQuery<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables>(
    HeroParentTypeDependentFieldDocument,
    baseOptions
  );
}
export type HeroParentTypeDependentFieldQueryHookResult = ReturnType<typeof useHeroParentTypeDependentFieldQuery>;
export type HeroParentTypeDependentFieldLazyQueryHookResult = ReturnType<
  typeof useHeroParentTypeDependentFieldLazyQuery
>;
export type HeroParentTypeDependentFieldQueryResult = Apollo.QueryResult<
  HeroParentTypeDependentFieldQuery,
  HeroParentTypeDependentFieldQueryVariables
>;
