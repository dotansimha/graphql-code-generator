import * as Types from '../types.d';

import gql from 'graphql-tag';
import * as React from 'react';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHoc from '@apollo/react-hoc';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type HeroDetailsQueryVariables = Types.Exact<{
  episode?: Types.Maybe<Types.Episode>;
}>;

export type HeroDetailsQuery = { __typename?: 'Query' } & {
  hero?: Types.Maybe<
    | ({ __typename?: 'Human' } & Pick<Types.Human, 'height' | 'name'>)
    | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'primaryFunction' | 'name'>)
  >;
};

export const HeroDetailsDocument = gql`
  query HeroDetails($episode: Episode) {
    hero(episode: $episode) {
      name
      ... on Human {
        height
      }
      ... on Droid {
        primaryFunction
      }
    }
  }
`;
export type HeroDetailsComponentProps = Omit<
  ApolloReactComponents.QueryComponentOptions<HeroDetailsQuery, HeroDetailsQueryVariables>,
  'query'
>;

export const HeroDetailsComponent = (props: HeroDetailsComponentProps) => (
  <ApolloReactComponents.Query<HeroDetailsQuery, HeroDetailsQueryVariables> query={HeroDetailsDocument} {...props} />
);

export type HeroDetailsProps<TChildProps = {}, TDataName extends string = 'data'> = {
  [key in TDataName]: ApolloReactHoc.DataValue<HeroDetailsQuery, HeroDetailsQueryVariables>;
} &
  TChildProps;
export function withHeroDetails<TProps, TChildProps = {}, TDataName extends string = 'data'>(
  operationOptions?: ApolloReactHoc.OperationOption<
    TProps,
    HeroDetailsQuery,
    HeroDetailsQueryVariables,
    HeroDetailsProps<TChildProps, TDataName>
  >
) {
  return ApolloReactHoc.withQuery<
    TProps,
    HeroDetailsQuery,
    HeroDetailsQueryVariables,
    HeroDetailsProps<TChildProps, TDataName>
  >(HeroDetailsDocument, {
    alias: 'heroDetails',
    ...operationOptions,
  });
}
export type HeroDetailsQueryResult = ApolloReactCommon.QueryResult<HeroDetailsQuery, HeroDetailsQueryVariables>;
