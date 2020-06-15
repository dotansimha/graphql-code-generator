import * as Types from '../types.d';

import gql from 'graphql-tag';
import * as React from 'react';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHoc from '@apollo/react-hoc';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type TwoHeroesQueryVariables = Types.Exact<{ [key: string]: never }>;

export type TwoHeroesQuery = { __typename?: 'Query' } & {
  r2?: Types.Maybe<
    ({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
  >;
  luke?: Types.Maybe<
    ({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
  >;
};

export const TwoHeroesDocument = gql`
  query TwoHeroes {
    r2: hero {
      name
    }
    luke: hero(episode: EMPIRE) {
      name
    }
  }
`;
export type TwoHeroesComponentProps = Omit<
  ApolloReactComponents.QueryComponentOptions<TwoHeroesQuery, TwoHeroesQueryVariables>,
  'query'
>;

export const TwoHeroesComponent = (props: TwoHeroesComponentProps) => (
  <ApolloReactComponents.Query<TwoHeroesQuery, TwoHeroesQueryVariables> query={TwoHeroesDocument} {...props} />
);

export type TwoHeroesProps<TChildProps = {}, TDataName extends string = 'data'> = {
  [key in TDataName]: ApolloReactHoc.DataValue<TwoHeroesQuery, TwoHeroesQueryVariables>;
} &
  TChildProps;
export function withTwoHeroes<TProps, TChildProps = {}, TDataName extends string = 'data'>(
  operationOptions?: ApolloReactHoc.OperationOption<
    TProps,
    TwoHeroesQuery,
    TwoHeroesQueryVariables,
    TwoHeroesProps<TChildProps, TDataName>
  >
) {
  return ApolloReactHoc.withQuery<
    TProps,
    TwoHeroesQuery,
    TwoHeroesQueryVariables,
    TwoHeroesProps<TChildProps, TDataName>
  >(TwoHeroesDocument, {
    alias: 'twoHeroes',
    ...operationOptions,
  });
}
export type TwoHeroesQueryResult = ApolloReactCommon.QueryResult<TwoHeroesQuery, TwoHeroesQueryVariables>;
