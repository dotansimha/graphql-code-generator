import * as Types from '../types';

type Maybe<T> = T | null;

export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & Pick<Types.Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>) });
