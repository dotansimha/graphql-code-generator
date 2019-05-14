import * as Types from '../types';

export type RepoInfoFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'createdAt'> & { repository: ({ __typename?: 'Repository' } & Pick<Types.Repository, 'description' | 'stargazers_count' | 'open_issues_count'>), postedBy: ({ __typename?: 'User' } & Pick<Types.User, 'html_url' | 'login'>) });

import gql from 'graphql-tag';
export const RepoInfoFragmentDoc = gql`
    fragment RepoInfo on Entry {
  createdAt
  repository {
    description
    stargazers_count
    open_issues_count
  }
  postedBy {
    html_url
    login
  }
}
    `;
