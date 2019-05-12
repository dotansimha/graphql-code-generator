import * as Types from '../types';

type Maybe<T> = T | null;

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login' | 'avatar_url'>)> });

export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & Pick<Types.Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>) });

export type FeedEntryFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'id' | 'commentCount'> & { repository: ({ __typename?: 'Repository' } & Pick<Types.Repository, 'full_name' | 'html_url'> & { owner: Maybe<({ __typename?: 'User' } & Pick<Types.User, 'avatar_url'>)> }) } & (VoteButtonsFragment & RepoInfoFragment));

export type RepoInfoFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'createdAt'> & { repository: ({ __typename?: 'Repository' } & Pick<Types.Repository, 'description' | 'stargazers_count' | 'open_issues_count'>), postedBy: ({ __typename?: 'User' } & Pick<Types.User, 'html_url' | 'login'>) });

export type VoteButtonsFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'score'> & { vote: ({ __typename?: 'Vote' } & Pick<Types.Vote, 'vote_value'>) });
