import * as Types from '../types.d';

import { HumanFieldsFragment } from './HumanFields';
import gql from 'graphql-tag';
import { HumanFieldsFragmentDoc } from './HumanFields';
import * as React from 'react';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHoc from '@apollo/react-hoc';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type HumanWithNullHeightQueryVariables = {};

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
export type HumanWithNullHeightComponentProps = Omit<
  ApolloReactComponents.QueryComponentOptions<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>,
  'query'
>;

export const HumanWithNullHeightComponent = (props: HumanWithNullHeightComponentProps) => (
  <ApolloReactComponents.Query<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>
    query={HumanWithNullHeightDocument}
    {...props}
  />
);

export type HumanWithNullHeightProps<TChildProps = {}> = ApolloReactHoc.DataProps<
  HumanWithNullHeightQuery,
  HumanWithNullHeightQueryVariables
> &
  TChildProps;
export function withHumanWithNullHeight<TProps, TChildProps = {}>(
  operationOptions?: ApolloReactHoc.OperationOption<
    TProps,
    HumanWithNullHeightQuery,
    HumanWithNullHeightQueryVariables,
    HumanWithNullHeightProps<TChildProps>
  >
) {
  return ApolloReactHoc.withQuery<
    TProps,
    HumanWithNullHeightQuery,
    HumanWithNullHeightQueryVariables,
    HumanWithNullHeightProps<TChildProps>
  >(HumanWithNullHeightDocument, {
    alias: 'humanWithNullHeight',
    ...operationOptions,
  });
}
export type HumanWithNullHeightQueryResult = ApolloReactCommon.QueryResult<
  HumanWithNullHeightQuery,
  HumanWithNullHeightQueryVariables
>;
