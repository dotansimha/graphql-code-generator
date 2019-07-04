/* eslint-disable */
import * as Types from './gql/__generated__/types';

import { ComponentB_TypeAFragment } from './ComponentB/document.generated';
import { ComponentA_TypeAFragment } from './ComponentA/document.generated';
import gql from 'graphql-tag';
import { ComponentA_TypeAFragmentDoc } from './ComponentA/document.generated';
import { ComponentB_TypeAFragmentDoc } from './ComponentB/document.generated';
import * as React from 'react';
import * as ReactApollo from 'react-apollo';
import * as ReactApolloHooks from 'react-apollo-hooks';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type ComponentC_FetchThingsQueryVariables = {};

export type ComponentC_FetchThingsQuery = { __typename?: 'Query' } & { things: { __typename?: 'TypeA' } & ComponentC_TypeAFragment };

export type ComponentC_TypeAFragment = { __typename?: 'TypeA' } & (ComponentA_TypeAFragment & ComponentB_TypeAFragment);
export const ComponentC_TypeAFragmentDoc = gql`
  fragment ComponentC_TypeA on TypeA {
    ...ComponentA_TypeA
    ...ComponentB_TypeA
  }
  ${ComponentA_TypeAFragmentDoc}
  ${ComponentB_TypeAFragmentDoc}
`;
export const ComponentC_FetchThingsDocument = gql`
  query ComponentC_FetchThings {
    things {
      ...ComponentC_TypeA
    }
  }
  ${ComponentC_TypeAFragmentDoc}
`;
export type ComponentC_FetchThingsComponentProps = Omit<ReactApollo.QueryProps<ComponentC_FetchThingsQuery, ComponentC_FetchThingsQueryVariables>, 'query'>;

export const ComponentC_FetchThingsComponent = (props: ComponentC_FetchThingsComponentProps) => <ReactApollo.Query<ComponentC_FetchThingsQuery, ComponentC_FetchThingsQueryVariables> query={ComponentC_FetchThingsDocument} {...props} />;

export type ComponentC_FetchThingsProps<TChildProps = {}> = Partial<ReactApollo.DataProps<ComponentC_FetchThingsQuery, ComponentC_FetchThingsQueryVariables>> & TChildProps;
export function withComponentC_FetchThings<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<TProps, ComponentC_FetchThingsQuery, ComponentC_FetchThingsQueryVariables, ComponentC_FetchThingsProps<TChildProps>>) {
  return ReactApollo.withQuery<TProps, ComponentC_FetchThingsQuery, ComponentC_FetchThingsQueryVariables, ComponentC_FetchThingsProps<TChildProps>>(ComponentC_FetchThingsDocument, {
    alias: 'withComponentC_FetchThings',
    ...operationOptions,
  });
}

export function useComponentC_FetchThingsQuery(baseOptions?: ReactApolloHooks.QueryHookOptions<ComponentC_FetchThingsQueryVariables>) {
  return ReactApolloHooks.useQuery<ComponentC_FetchThingsQuery, ComponentC_FetchThingsQueryVariables>(ComponentC_FetchThingsDocument, baseOptions);
}
