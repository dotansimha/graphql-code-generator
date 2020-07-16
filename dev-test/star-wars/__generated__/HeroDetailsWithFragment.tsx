import * as Types from '../types.d';

import { HeroDetails_Human_Fragment, HeroDetails_Droid_Fragment } from './HeroDetailsFragment';
import gql from 'graphql-tag';
import { HeroDetailsFragmentDoc } from './HeroDetailsFragment';
import * as React from 'react';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHoc from '@apollo/react-hoc';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type HeroDetailsWithFragmentQueryVariables = Types.Exact<{
  episode?: Types.Maybe<Types.Episode>;
}>;

export type HeroDetailsWithFragmentQuery = { __typename?: 'Query' } & {
  hero?: Types.Maybe<
    ({ __typename?: 'Human' } & HeroDetails_Human_Fragment) | ({ __typename?: 'Droid' } & HeroDetails_Droid_Fragment)
  >;
};

export const HeroDetailsWithFragmentDocument = gql`
  query HeroDetailsWithFragment($episode: Episode) {
    hero(episode: $episode) {
      ...HeroDetails
    }
  }
  ${HeroDetailsFragmentDoc}
`;
export type HeroDetailsWithFragmentComponentProps = Omit<
  ApolloReactComponents.QueryComponentOptions<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>,
  'query'
>;

export const HeroDetailsWithFragmentComponent = (props: HeroDetailsWithFragmentComponentProps) => (
  <ApolloReactComponents.Query<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>
    query={HeroDetailsWithFragmentDocument}
    {...props}
  />
);

export type HeroDetailsWithFragmentProps<TChildProps = {}, TDataName extends string = 'data'> = {
  [key in TDataName]: ApolloReactHoc.DataValue<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>;
} &
  TChildProps;
export function withHeroDetailsWithFragment<TProps, TChildProps = {}, TDataName extends string = 'data'>(
  operationOptions?: ApolloReactHoc.OperationOption<
    TProps,
    HeroDetailsWithFragmentQuery,
    HeroDetailsWithFragmentQueryVariables,
    HeroDetailsWithFragmentProps<TChildProps, TDataName>
  >
) {
  return ApolloReactHoc.withQuery<
    TProps,
    HeroDetailsWithFragmentQuery,
    HeroDetailsWithFragmentQueryVariables,
    HeroDetailsWithFragmentProps<TChildProps, TDataName>
  >(HeroDetailsWithFragmentDocument, {
    alias: 'heroDetailsWithFragment',
    ...operationOptions,
  });
}
export type HeroDetailsWithFragmentQueryResult = ApolloReactCommon.QueryResult<
  HeroDetailsWithFragmentQuery,
  HeroDetailsWithFragmentQueryVariables
>;
