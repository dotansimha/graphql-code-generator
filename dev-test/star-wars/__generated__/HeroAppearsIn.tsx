import * as Types from '../types.d';

import gql from 'graphql-tag';
import * as React from 'react';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHoc from '@apollo/react-hoc';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type HeroAppearsInQueryVariables = Types.Exact<{ [key: string]: never }>;

export type HeroAppearsInQuery = { __typename?: 'Query' } & {
  hero?: Types.Maybe<
    | ({ __typename?: 'Human' } & Pick<Types.Human, 'name' | 'appearsIn'>)
    | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name' | 'appearsIn'>)
  >;
};

export const HeroAppearsInDocument = gql`
  query HeroAppearsIn {
    hero {
      name
      appearsIn
    }
  }
`;
export type HeroAppearsInComponentProps = Omit<
  ApolloReactComponents.QueryComponentOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>,
  'query'
>;

export const HeroAppearsInComponent = (props: HeroAppearsInComponentProps) => (
  <ApolloReactComponents.Query<HeroAppearsInQuery, HeroAppearsInQueryVariables>
    query={HeroAppearsInDocument}
    {...props}
  />
);

export type HeroAppearsInProps<TChildProps = {}, TDataName extends string = 'data'> = {
  [key in TDataName]: ApolloReactHoc.DataValue<HeroAppearsInQuery, HeroAppearsInQueryVariables>;
} &
  TChildProps;
export function withHeroAppearsIn<TProps, TChildProps = {}, TDataName extends string = 'data'>(
  operationOptions?: ApolloReactHoc.OperationOption<
    TProps,
    HeroAppearsInQuery,
    HeroAppearsInQueryVariables,
    HeroAppearsInProps<TChildProps, TDataName>
  >
) {
  return ApolloReactHoc.withQuery<
    TProps,
    HeroAppearsInQuery,
    HeroAppearsInQueryVariables,
    HeroAppearsInProps<TChildProps, TDataName>
  >(HeroAppearsInDocument, {
    alias: 'heroAppearsIn',
    ...operationOptions,
  });
}
export type HeroAppearsInQueryResult = ApolloReactCommon.QueryResult<HeroAppearsInQuery, HeroAppearsInQueryVariables>;
