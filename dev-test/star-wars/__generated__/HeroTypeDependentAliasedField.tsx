import * as Types from '../types.d';

import gql from 'graphql-tag';
import * as React from 'react';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHoc from '@apollo/react-hoc';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type HeroTypeDependentAliasedFieldQueryVariables = Types.Exact<{
  episode?: Types.Maybe<Types.Episode>;
}>;

export type HeroTypeDependentAliasedFieldQuery = { __typename?: 'Query' } & {
  hero?: Types.Maybe<
    | ({ __typename?: 'Human' } & { property: Types.Human['homePlanet'] })
    | ({ __typename?: 'Droid' } & { property: Types.Droid['primaryFunction'] })
  >;
};

export const HeroTypeDependentAliasedFieldDocument = gql`
  query HeroTypeDependentAliasedField($episode: Episode) {
    hero(episode: $episode) {
      ... on Human {
        property: homePlanet
      }
      ... on Droid {
        property: primaryFunction
      }
    }
  }
`;
export type HeroTypeDependentAliasedFieldComponentProps = Omit<
  ApolloReactComponents.QueryComponentOptions<
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables
  >,
  'query'
>;

export const HeroTypeDependentAliasedFieldComponent = (props: HeroTypeDependentAliasedFieldComponentProps) => (
  <ApolloReactComponents.Query<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables>
    query={HeroTypeDependentAliasedFieldDocument}
    {...props}
  />
);

export type HeroTypeDependentAliasedFieldProps<TChildProps = {}, TDataName extends string = 'data'> = {
  [key in TDataName]: ApolloReactHoc.DataValue<
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables
  >;
} &
  TChildProps;
export function withHeroTypeDependentAliasedField<TProps, TChildProps = {}, TDataName extends string = 'data'>(
  operationOptions?: ApolloReactHoc.OperationOption<
    TProps,
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables,
    HeroTypeDependentAliasedFieldProps<TChildProps, TDataName>
  >
) {
  return ApolloReactHoc.withQuery<
    TProps,
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables,
    HeroTypeDependentAliasedFieldProps<TChildProps, TDataName>
  >(HeroTypeDependentAliasedFieldDocument, {
    alias: 'heroTypeDependentAliasedField',
    ...operationOptions,
  });
}
export type HeroTypeDependentAliasedFieldQueryResult = ApolloReactCommon.QueryResult<
  HeroTypeDependentAliasedFieldQuery,
  HeroTypeDependentAliasedFieldQueryVariables
>;
