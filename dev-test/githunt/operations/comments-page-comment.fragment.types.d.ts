import * as Types from './common.d';

export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & Pick<Types.Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>) });
