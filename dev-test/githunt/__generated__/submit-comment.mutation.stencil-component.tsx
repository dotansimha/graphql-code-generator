import gql from 'graphql-tag';
import { CommentsPageCommentFragmentDoc } from './comments-page-comment.fragment.stencil-component.js';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';

declare global {
  export type SubmitCommentMutationVariables = Types.Exact<{
    repoFullName: Types.Scalars['String'];
    commentContent: Types.Scalars['String'];
  }>;

  export type SubmitCommentMutation = {
    __typename?: 'Mutation';
    submitComment?: {
      __typename?: 'Comment';
      id: number;
      createdAt: number;
      content: string;
      postedBy: { __typename?: 'User'; login: string; html_url: string };
    } | null;
  };
}

const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

@Component({
  tag: 'apollo-submit-comment',
})
export class SubmitCommentComponent {
  @Prop() renderer: import('stencil-apollo').MutationRenderer<SubmitCommentMutation, SubmitCommentMutationVariables>;
  @Prop() variables: SubmitCommentMutationVariables;
  render() {
    return <apollo-mutation mutation={SubmitCommentDocument} variables={this.variables} renderer={this.renderer} />;
  }
}
