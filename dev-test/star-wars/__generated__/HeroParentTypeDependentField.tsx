import * as Types from '../types.d';

import gql from 'graphql-tag';
import * as React from 'react';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHoc from '@apollo/react-hoc';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type HeroParentTypeDependentFieldQueryVariables = Types.Exact<{
  episode?: Types.Maybe<Types.Episode>;
}>;

export type HeroParentTypeDependentFieldQuery = { __typename?: 'Query' } & {
  hero?: Types.Maybe<
    | ({ __typename?: 'Human' } & Pick<Types.Human, 'name'> & {
          friends?: Types.Maybe<
            Array<
              Types.Maybe<
                | ({ __typename?: 'Human' } & Pick<Types.Human, 'height' | 'name'>)
                | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
              >
            >
          >;
        })
    | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'> & {
          friends?: Types.Maybe<
            Array<
              Types.Maybe<
                | ({ __typename?: 'Human' } & Pick<Types.Human, 'height' | 'name'>)
                | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
              >
            >
          >;
        })
  >;
};

export const HeroParentTypeDependentFieldDocument = gql`
  query HeroParentTypeDependentField($episode: Episode) {
    hero(episode: $episode) {
      name
      ... on Human {
        friends {
          name
          ... on Human {
            height(unit: FOOT)
          }
        }
      }
      ... on Droid {
        friends {
          name
          ... on Human {
            height(unit: METER)
          }
        }
      }
    }
  }
`;
export type HeroParentTypeDependentFieldComponentProps = Omit<
  ApolloReactComponents.QueryComponentOptions<
    HeroParentTypeDependentFieldQuery,
    HeroParentTypeDependentFieldQueryVariables
  >,
  'query'
>;

export const HeroParentTypeDependentFieldComponent = (props: HeroParentTypeDependentFieldComponentProps) => (
  <ApolloReactComponents.Query<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables>
    query={HeroParentTypeDependentFieldDocument}
    {...props}
  />
);

export type HeroParentTypeDependentFieldProps<TChildProps = {}, TDataName extends string = 'data'> = {
  [key in TDataName]: ApolloReactHoc.DataValue<
    HeroParentTypeDependentFieldQuery,
    HeroParentTypeDependentFieldQueryVariables
  >;
} &
  TChildProps;
export function withHeroParentTypeDependentField<TProps, TChildProps = {}, TDataName extends string = 'data'>(
  operationOptions?: ApolloReactHoc.OperationOption<
    TProps,
    HeroParentTypeDependentFieldQuery,
    HeroParentTypeDependentFieldQueryVariables,
    HeroParentTypeDependentFieldProps<TChildProps, TDataName>
  >
) {
  return ApolloReactHoc.withQuery<
    TProps,
    HeroParentTypeDependentFieldQuery,
    HeroParentTypeDependentFieldQueryVariables,
    HeroParentTypeDependentFieldProps<TChildProps, TDataName>
  >(HeroParentTypeDependentFieldDocument, {
    alias: 'heroParentTypeDependentField',
    ...operationOptions,
  });
}
export type HeroParentTypeDependentFieldQueryResult = ApolloReactCommon.QueryResult<
  HeroParentTypeDependentFieldQuery,
  HeroParentTypeDependentFieldQueryVariables
>;
