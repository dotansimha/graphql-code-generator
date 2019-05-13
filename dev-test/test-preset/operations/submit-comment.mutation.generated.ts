import * as Types from '../types';

import { CommentsPageCommentFragment } from './comments-page-comment.fragment.generated';
export type SubmitCommentMutationVariables = {
  repoFullName: Types.Maybe<Types.Scalars['String']>,
  commentContent: Types.Maybe<Types.Scalars['String']>
};


export type SubmitCommentMutation = ({ __typename?: 'Mutation' } & { submitComment: Types.Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)> });
