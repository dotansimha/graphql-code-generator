import * as Types from '../types.d.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type HeroAndFriendsNamesQueryVariables = Types.Exact<{
  episode?: Types.InputMaybe<Types.Episode>;
}>;

export type HeroAndFriendsNamesQuery = {
  __typename?: 'Query';
  hero?:
    | {
        __typename?: 'Droid';
        name: string;
        friends?: Array<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null> | null;
      }
    | {
        __typename?: 'Human';
        name: string;
        friends?: Array<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null> | null;
      }
    | null;
};

export const HeroAndFriendsNamesDocument = gql`
  query HeroAndFriendsNames($episode: Episode) {
    hero(episode: $episode) {
      name
      friends {
        name
      }
    }
  }
`;

/**
 * __useHeroAndFriendsNamesQuery__
 *
 * To run a query within a React component, call `useHeroAndFriendsNamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroAndFriendsNamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroAndFriendsNamesQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroAndFriendsNamesQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>(
    HeroAndFriendsNamesDocument,
    options
  );
}
export function useHeroAndFriendsNamesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>(
    HeroAndFriendsNamesDocument,
    options
  );
}
export type HeroAndFriendsNamesQueryHookResult = ReturnType<typeof useHeroAndFriendsNamesQuery>;
export type HeroAndFriendsNamesLazyQueryHookResult = ReturnType<typeof useHeroAndFriendsNamesLazyQuery>;
export type HeroAndFriendsNamesQueryResult = Apollo.QueryResult<
  HeroAndFriendsNamesQuery,
  HeroAndFriendsNamesQueryVariables
>;
