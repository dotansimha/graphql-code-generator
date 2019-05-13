import * as Types from '../types';

export type OnCommentAddedSubscriptionVariables = {
  repoFullName: Types.Maybe<Types.Scalars['String']>
};


export type OnCommentAddedSubscription = ({ __typename?: 'Subscription' } & { commentAdded: Types.Maybe<({ __typename?: 'Comment' } & Pick<Types.Comment, 'id' | 'createdAt' | 'content'> & { postedBy: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>)> })> });

import gql from 'graphql-tag';
import * as React from 'react';
import * as ReactApollo from 'react-apollo';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const OnCommentAddedDocument = gql`
    subscription onCommentAdded($repoFullName: String!) {
  commentAdded(repoFullName: $repoFullName) {
    id
    postedBy {
      login
      html_url
    }
    createdAt
    content
  }
}
    `;

export const OnCommentAddedComponent = (props: Omit<Omit<ReactApollo.SubscriptionProps<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>, 'subscription'>, 'variables'> & { variables?: OnCommentAddedSubscriptionVariables }) => (
  <ReactApollo.Subscription<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables> subscription={OnCommentAddedDocument} {...props} />
);

export type OnCommentAddedProps<TChildProps = {}> = Partial<ReactApollo.DataProps<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>> & TChildProps;
export function withOnCommentAdded<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  OnCommentAddedSubscription,
  OnCommentAddedSubscriptionVariables,
  OnCommentAddedProps<TChildProps>>) {
    return ReactApollo.withSubscription<TProps, OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables, OnCommentAddedProps<TChildProps>>(OnCommentAddedDocument, {
      alias: 'withOnCommentAdded',
      ...operationOptions
    });
}
