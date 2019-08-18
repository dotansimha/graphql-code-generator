// tslint:disable
import * as Types from './types.d';

import gql from 'graphql-tag';
import { VoteButtonsFragmentDoc } from './vote-buttons.fragment.stencil-component';
import { RepoInfoFragmentDoc } from './repo-info.fragment.stencil-component';

declare global {
  export type FeedEntryFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'id' | 'commentCount'> & {
      repository: { __typename?: 'Repository' } & Pick<Types.Repository, 'full_name' | 'html_url'> & { owner: Types.Maybe<{ __typename?: 'User' } & Pick<Types.User, 'avatar_url'>> };
    }) &
    VoteButtonsFragment &
    RepoInfoFragment;
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
