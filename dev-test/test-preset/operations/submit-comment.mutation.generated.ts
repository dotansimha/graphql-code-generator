import { CommentsPageCommentFragment } from './comments-page-comment.fragment.generated';
import * as Types from '../types';

type Maybe<T> = T | null;

export type SubmitCommentMutationVariables = {
  repoFullName: Types.Scalars['String'],
  commentContent: Types.Scalars['String']
};


export type SubmitCommentMutation = ({ __typename?: 'Mutation' } & { submitComment: Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)> });
