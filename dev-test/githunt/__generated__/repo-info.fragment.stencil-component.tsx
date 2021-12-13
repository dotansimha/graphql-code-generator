import gql from 'graphql-tag';

declare global {
  export type RepoInfoFragment = {
    __typename?: 'Entry';
    createdAt: number;
    repository: {
      __typename?: 'Repository';
      description?: string | null | undefined;
      stargazers_count: number;
      open_issues_count?: number | null | undefined;
    };
    postedBy: { __typename?: 'User'; html_url: string; login: string };
  };
}

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
