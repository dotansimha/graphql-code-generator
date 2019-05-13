import * as Types from '../types';

import { CommentsPageCommentFragment } from './comments-page-comment.fragment.generated';
export type CommentQueryVariables = {
  repoFullName: Types.Maybe<Types.Scalars['String']>,
  limit?: Types.Maybe<Types.Scalars['Int']>,
  offset?: Types.Maybe<Types.Scalars['Int']>
};


export type CommentQuery = ({ __typename?: 'Query' } & { currentUser: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>)>, entry: Types.Maybe<({ __typename?: 'Entry' } & Pick<Types.Entry, 'id' | 'createdAt' | 'commentCount'> & { postedBy: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>)>, comments: Types.Maybe<Array<Types.Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)>>>, repository: Types.Maybe<({ __typename?: 'Repository' } & Pick<Types.Repository, 'full_name' | 'html_url'> & ({ __typename?: 'Repository' } & Pick<Types.Repository, 'description' | 'open_issues_count' | 'stargazers_count'>))> })> });
