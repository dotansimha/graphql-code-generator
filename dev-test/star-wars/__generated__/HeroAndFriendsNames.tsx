import * as Types from '../types.d';

import gql from 'graphql-tag';
import * as React from 'react';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHoc from '@apollo/react-hoc';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type HeroAndFriendsNamesQueryVariables = Types.Exact<{
  episode?: Types.Maybe<Types.Episode>;
}>;

export type HeroAndFriendsNamesQuery = { __typename?: 'Query' } & {
  hero?: Types.Maybe<
    | ({ __typename?: 'Human' } & Pick<Types.Human, 'name'> & {
          friends?: Types.Maybe<
            Array<
              Types.Maybe<
                | ({ __typename?: 'Human' } & Pick<Types.Human, 'name'>)
                | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
              >
            >
          >;
        })
    | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'> & {
          friends?: Types.Maybe<
            Array<
              Types.Maybe<
                | ({ __typename?: 'Human' } & Pick<Types.Human, 'name'>)
                | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)
              >
            >
          >;
        })
  >;
};

export const HeroAndFriendsNamesDocument = gql`
  query HeroAndFriendsNames($episode: Episode) {
    hero(episode: $episode) {
      name
      friends {
        name
      }
    }
  }
`;
export type HeroAndFriendsNamesComponentProps = Omit<
  ApolloReactComponents.QueryComponentOptions<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>,
  'query'
>;

export const HeroAndFriendsNamesComponent = (props: HeroAndFriendsNamesComponentProps) => (
  <ApolloReactComponents.Query<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>
    query={HeroAndFriendsNamesDocument}
    {...props}
  />
);

export type HeroAndFriendsNamesProps<TChildProps = {}, TDataName extends string = 'data'> = {
  [key in TDataName]: ApolloReactHoc.DataValue<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>;
} &
  TChildProps;
export function withHeroAndFriendsNames<TProps, TChildProps = {}, TDataName extends string = 'data'>(
  operationOptions?: ApolloReactHoc.OperationOption<
    TProps,
    HeroAndFriendsNamesQuery,
    HeroAndFriendsNamesQueryVariables,
    HeroAndFriendsNamesProps<TChildProps, TDataName>
  >
) {
  return ApolloReactHoc.withQuery<
    TProps,
    HeroAndFriendsNamesQuery,
    HeroAndFriendsNamesQueryVariables,
    HeroAndFriendsNamesProps<TChildProps, TDataName>
  >(HeroAndFriendsNamesDocument, {
    alias: 'heroAndFriendsNames',
    ...operationOptions,
  });
}
export type HeroAndFriendsNamesQueryResult = ApolloReactCommon.QueryResult<
  HeroAndFriendsNamesQuery,
  HeroAndFriendsNamesQueryVariables
>;
