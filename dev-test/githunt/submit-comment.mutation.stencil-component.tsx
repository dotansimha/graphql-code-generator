// tslint:disable
import * as Types from './types.d';

import gql from 'graphql-tag';
import { CommentsPageCommentFragmentDoc } from './comments-page-comment.fragment.stencil-component';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';

    declare global { 
      export type SubmitCommentMutationVariables = {
  repoFullName: Types.Scalars['String'],
  commentContent: Types.Scalars['String']
};


export type SubmitCommentMutation = ({ __typename?: 'Mutation' } & { submitComment: Types.Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)> });
 
    }
          

 const SubmitCommentDocument = gql`
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
  submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
    ...CommentsPageComment
  }
}
    ${CommentsPageCommentFragmentDoc}`;

@Component({
    tag: 'apollo-submit-comment'
})
export class SubmitCommentComponent {
    @Prop() renderer: import('stencil-apollo').MutationRenderer<SubmitCommentMutation, SubmitCommentMutationVariables>;
    render() {
        return <apollo-mutation mutation={ SubmitCommentDocument } renderer={ this.renderer } />;
    }
}
      