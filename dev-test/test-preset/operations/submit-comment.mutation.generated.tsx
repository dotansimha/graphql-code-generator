import * as Types from '../types';

import { CommentsPageCommentFragment } from './comments-page-comment.fragment.generated';
export type SubmitCommentMutationVariables = {
  repoFullName: Types.Maybe<Types.Scalars['String']>,
  commentContent: Types.Maybe<Types.Scalars['String']>
};


export type SubmitCommentMutation = ({ __typename?: 'Mutation' } & { submitComment: Types.Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)> });

import gql from 'graphql-tag';
import * as React from 'react';
import * as ReactApollo from 'react-apollo';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const SubmitCommentDocument = gql`
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
  submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
    ...CommentsPageComment
  }
}
    ${CommentsPageCommentFragmentDoc}`;
export type SubmitCommentMutationFn = ReactApollo.MutationFn<SubmitCommentMutation, SubmitCommentMutationVariables>;

export const SubmitCommentComponent = (props: Omit<Omit<ReactApollo.MutationProps<SubmitCommentMutation, SubmitCommentMutationVariables>, 'mutation'>, 'variables'> & { variables?: SubmitCommentMutationVariables }) => (
  <ReactApollo.Mutation<SubmitCommentMutation, SubmitCommentMutationVariables> mutation={SubmitCommentDocument} {...props} />
);

export type SubmitCommentProps<TChildProps = {}> = Partial<ReactApollo.MutateProps<SubmitCommentMutation, SubmitCommentMutationVariables>> & TChildProps;
export function withSubmitComment<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  SubmitCommentMutation,
  SubmitCommentMutationVariables,
  SubmitCommentProps<TChildProps>>) {
    return ReactApollo.withMutation<TProps, SubmitCommentMutation, SubmitCommentMutationVariables, SubmitCommentProps<TChildProps>>(SubmitCommentDocument, {
      alias: 'withSubmitComment',
      ...operationOptions
    });
}
