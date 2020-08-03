import * as Types from '../types.d';

import { HumanFieldsFragment } from './HumanFields';
import { gql } from '@apollo/client';
import { HumanFieldsFragmentDoc } from './HumanFields';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';

export type HumanWithNullHeightQueryVariables = Types.Exact<{ [key: string]: never }>;

export type HumanWithNullHeightQuery = { __typename?: 'Query' } & {
  human?: Types.Maybe<{ __typename?: 'Human' } & HumanFieldsFragment>;
};

export const HumanWithNullHeightDocument = gql`
  query HumanWithNullHeight {
    human(id: 1004) {
      ...HumanFields
    }
  }
  ${HumanFieldsFragmentDoc}
`;

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
  baseOptions?: ApolloReactHooks.QueryHookOptions<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>
) {
  return ApolloReactHooks.useQuery<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>(
    HumanWithNullHeightDocument,
    baseOptions
  );
}
export function useHumanWithNullHeightLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>
) {
  return ApolloReactHooks.useLazyQuery<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>(
    HumanWithNullHeightDocument,
    baseOptions
  );
}
export type HumanWithNullHeightQueryHookResult = ReturnType<typeof useHumanWithNullHeightQuery>;
export type HumanWithNullHeightLazyQueryHookResult = ReturnType<typeof useHumanWithNullHeightLazyQuery>;
export type HumanWithNullHeightQueryResult = ApolloReactCommon.QueryResult<
  HumanWithNullHeightQuery,
  HumanWithNullHeightQueryVariables
>;
