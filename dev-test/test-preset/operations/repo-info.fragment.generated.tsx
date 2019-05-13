import * as Types from '../types';

export type RepoInfoFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'createdAt'> & { repository: Types.Maybe<({ __typename?: 'Repository' } & Pick<Types.Repository, 'description' | 'stargazers_count' | 'open_issues_count'>)>, postedBy: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'html_url' | 'login'>)> });
