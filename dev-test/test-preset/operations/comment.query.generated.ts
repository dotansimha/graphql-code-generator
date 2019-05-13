import { CommentsPageCommentFragment } from './comments-page-comment.fragment.generated';
import * as Types from '../types';

type Maybe<T> = T | null;

export type CommentQueryVariables = {
  repoFullName: Types.Scalars['String'],
  limit?: Maybe<Types.Scalars['Int']>,
  offset?: Maybe<Types.Scalars['Int']>
};


export type CommentQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>)>, entry: Maybe<({ __typename?: 'Entry' } & Pick<Types.Entry, 'id' | 'createdAt' | 'commentCount'> & { postedBy: ({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>), comments: Array<Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)>>, repository: ({ __typename?: 'Repository' } & Pick<Types.Repository, 'full_name' | 'html_url'> & ({ __typename?: 'Repository' } & Pick<Types.Repository, 'description' | 'open_issues_count' | 'stargazers_count'>)) })> });
