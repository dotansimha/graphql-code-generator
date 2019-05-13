import * as Types from '../types';

import { FeedEntryFragment } from './feed-entry.fragment.generated';
export type FeedQueryVariables = {
  type: Types.Maybe<Types.FeedType>,
  offset?: Types.Maybe<Types.Scalars['Int']>,
  limit?: Types.Maybe<Types.Scalars['Int']>
};


export type FeedQuery = ({ __typename?: 'Query' } & { currentUser: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login'>)>, feed: Types.Maybe<Array<Types.Maybe<({ __typename?: 'Entry' } & FeedEntryFragment)>>> });

import gql from 'graphql-tag';
import * as React from 'react';
import * as ReactApollo from 'react-apollo';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const FeedDocument = gql`
    query Feed($type: FeedType!, $offset: Int, $limit: Int) {
  currentUser {
    login
  }
  feed(type: $type, offset: $offset, limit: $limit) {
    ...FeedEntry
  }
}
    ${FeedEntryFragmentDoc}`;

export const FeedComponent = (props: Omit<Omit<ReactApollo.QueryProps<FeedQuery, FeedQueryVariables>, 'query'>, 'variables'> & { variables: FeedQueryVariables }) => (
  <ReactApollo.Query<FeedQuery, FeedQueryVariables> query={FeedDocument} {...props} />
);

export type FeedProps<TChildProps = {}> = Partial<ReactApollo.DataProps<FeedQuery, FeedQueryVariables>> & TChildProps;
export function withFeed<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  FeedQuery,
  FeedQueryVariables,
  FeedProps<TChildProps>>) {
    return ReactApollo.withQuery<TProps, FeedQuery, FeedQueryVariables, FeedProps<TChildProps>>(FeedDocument, {
      alias: 'withFeed',
      ...operationOptions
    });
}
