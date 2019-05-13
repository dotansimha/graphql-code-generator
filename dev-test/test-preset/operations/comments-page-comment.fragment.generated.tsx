import * as Types from '../types';

export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & Pick<Types.Comment, 'id' | 'createdAt' | 'content'> & { postedBy: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>)> });
