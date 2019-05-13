import * as Types from '../types';

type Maybe<T> = T | null;

export type RepoInfoFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'createdAt'> & { repository: ({ __typename?: 'Repository' } & Pick<Types.Repository, 'description' | 'stargazers_count' | 'open_issues_count'>), postedBy: ({ __typename?: 'User' } & Pick<Types.User, 'html_url' | 'login'>) });
