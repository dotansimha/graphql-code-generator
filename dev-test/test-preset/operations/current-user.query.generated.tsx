import * as Types from '../types';

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ __typename?: 'Query' } & { currentUser: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login' | 'avatar_url'>)> });

import gql from 'graphql-tag';
import * as React from 'react';
import * as ReactApollo from 'react-apollo';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const CurrentUserForProfileDocument = gql`
    query CurrentUserForProfile {
  currentUser {
    login
    avatar_url
  }
}
    `;

export const CurrentUserForProfileComponent = (props: Omit<Omit<ReactApollo.QueryProps<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>, 'query'>, 'variables'> & { variables?: CurrentUserForProfileQueryVariables }) => (
  <ReactApollo.Query<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables> query={CurrentUserForProfileDocument} {...props} />
);

export type CurrentUserForProfileProps<TChildProps = {}> = Partial<ReactApollo.DataProps<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>> & TChildProps;
export function withCurrentUserForProfile<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  CurrentUserForProfileQuery,
  CurrentUserForProfileQueryVariables,
  CurrentUserForProfileProps<TChildProps>>) {
    return ReactApollo.withQuery<TProps, CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables, CurrentUserForProfileProps<TChildProps>>(CurrentUserForProfileDocument, {
      alias: 'withCurrentUserForProfile',
      ...operationOptions
    });
}
