import gql from 'graphql-tag';
import { VoteButtonsFragmentDoc } from './vote-buttons.fragment.stencil-component';
import { RepoInfoFragmentDoc } from './repo-info.fragment.stencil-component';

declare global {
  export type FeedEntryFragment = { __typename?: 'Entry' } & Pick<
    Types.Entry,
    'id' | 'commentCount' | 'score' | 'createdAt'
  > & {
      repository: { __typename?: 'Repository' } & Pick<
        Types.Repository,
        'full_name' | 'html_url' | 'description' | 'stargazers_count' | 'open_issues_count'
      > & { owner?: Types.Maybe<{ __typename?: 'User' } & Pick<Types.User, 'avatar_url'>> };
      vote: { __typename?: 'Vote' } & Pick<Types.Vote, 'vote_value'>;
      postedBy: { __typename?: 'User' } & Pick<Types.User, 'html_url' | 'login'>;
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
