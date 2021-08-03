import gql from 'graphql-tag';
import { VoteButtonsFragmentDoc } from './vote-buttons.fragment.stencil-component';
import { RepoInfoFragmentDoc } from './repo-info.fragment.stencil-component';

declare global {
  export type FeedEntryFragment = {
    __typename?: 'Entry';
    id: number;
    commentCount: number;
    score: number;
    createdAt: number;
    repository: {
      __typename?: 'Repository';
      full_name: string;
      html_url: string;
      description?: Types.Maybe<string>;
      stargazers_count: number;
      open_issues_count?: Types.Maybe<number>;
      owner?: Types.Maybe<{ __typename?: 'User'; avatar_url: string }>;
    };
    vote: { __typename?: 'Vote'; vote_value: number };
    postedBy: { __typename?: 'User'; html_url: string; login: string };
  };
}

export const FeedEntryFragmentDoc = gql`
  fragment FeedEntry on Entry {
    id
    commentCount
    repository {
      full_name
      html_url
      owner {
        avatar_url
      }
    }
    ...VoteButtons
    ...RepoInfo
  }
  ${VoteButtonsFragmentDoc}
  ${RepoInfoFragmentDoc}
`;
