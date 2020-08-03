import * as Types from '../types.d';

import { HumanFieldsFragment } from './HumanFields';
import { HumanFieldsFragmentDoc } from './HumanFields';
import * as Apollo from '@apollo/client';

export type HumanWithNullHeightQueryVariables = Types.Exact<{ [key: string]: never }>;

export type HumanWithNullHeightQuery = { __typename?: 'Query' } & {
  human?: Types.Maybe<{ __typename?: 'Human' } & HumanFieldsFragment>;
};

export const HumanWithNullHeightDocument = Apollo.gql`
    query HumanWithNullHeight {
  human(id: 1004) {
    ...HumanFields
  }
}
    ${HumanFieldsFragmentDoc}`;

/**
 * __useHumanWithNullHeightQuery__
 *
 * To run a query within a React component, call `useHumanWithNullHeightQuery` and pass it any options that fit your needs.
 * When your component renders, `useHumanWithNullHeightQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHumanWithNullHeightQuery({
 *   variables: {
 *   },
 * });
 */
export function useHumanWithNullHeightQuery(
  baseOptions?: Apollo.QueryHookOptions<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>
) {
  return Apollo.useQuery<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>(
    HumanWithNullHeightDocument,
    baseOptions
  );
}
export function useHumanWithNullHeightLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>
) {
  return Apollo.useLazyQuery<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>(
    HumanWithNullHeightDocument,
    baseOptions
  );
}
export type HumanWithNullHeightQueryHookResult = ReturnType<typeof useHumanWithNullHeightQuery>;
export type HumanWithNullHeightLazyQueryHookResult = ReturnType<typeof useHumanWithNullHeightLazyQuery>;
export type HumanWithNullHeightQueryResult = Apollo.QueryResult<
  HumanWithNullHeightQuery,
  HumanWithNullHeightQueryVariables
>;
