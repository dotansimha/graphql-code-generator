import * as Types from '../types';

import { CommentsPageCommentFragment } from './comments-page-comment.fragment.generated';
export type CommentQueryVariables = {
  repoFullName: Types.Scalars['String'],
  limit?: Types.Maybe<Types.Scalars['Int']>,
  offset?: Types.Maybe<Types.Scalars['Int']>
};


export type CommentQuery = ({ __typename?: 'Query' } & { currentUser: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>)>, entry: Types.Maybe<({ __typename?: 'Entry' } & Pick<Types.Entry, 'id' | 'createdAt' | 'commentCount'> & { postedBy: ({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>), comments: Array<Types.Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)>>, repository: ({ __typename?: 'Repository' } & Pick<Types.Repository, 'full_name' | 'html_url'> & ({ __typename?: 'Repository' } & Pick<Types.Repository, 'description' | 'open_issues_count' | 'stargazers_count'>)) })> });

import gql from 'graphql-tag';
import { CommentsPageCommentFragmentDoc } from './comments-page-comment.fragment.generated';
import * as React from 'react';
import * as ReactApollo from 'react-apollo';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const CommentDocument = gql`
    query Comment($repoFullName: String!, $limit: Int, $offset: Int) {
  currentUser {
    login
    html_url
  }
  entry(repoFullName: $repoFullName) {
    id
    postedBy {
      login
      html_url
    }
    createdAt
    comments(limit: $limit, offset: $offset) {
      ...CommentsPageComment
    }
    commentCount
    repository {
      full_name
      html_url
      ... on Repository {
        description
        open_issues_count
        stargazers_count
      }
    }
  }
}
    ${CommentsPageCommentFragmentDoc}`;

export const CommentComponent = (props: Omit<Omit<ReactApollo.QueryProps<CommentQuery, CommentQueryVariables>, 'query'>, 'variables'> & { variables: CommentQueryVariables }) => (
  <ReactApollo.Query<CommentQuery, CommentQueryVariables> query={CommentDocument} {...props} />
);

export type CommentProps<TChildProps = {}> = Partial<ReactApollo.DataProps<CommentQuery, CommentQueryVariables>> & TChildProps;
export function withComment<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  CommentQuery,
  CommentQueryVariables,
  CommentProps<TChildProps>>) {
    return ReactApollo.withQuery<TProps, CommentQuery, CommentQueryVariables, CommentProps<TChildProps>>(CommentDocument, {
      alias: 'withComment',
      ...operationOptions
    });
}
