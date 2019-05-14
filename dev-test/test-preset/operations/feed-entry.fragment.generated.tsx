import * as Types from '../types';

import { RepoInfoFragment } from './repo-info.fragment.generated';
import { VoteButtonsFragment } from './vote-buttons.fragment.generated';
export type FeedEntryFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'id' | 'commentCount'> & { repository: ({ __typename?: 'Repository' } & Pick<Types.Repository, 'full_name' | 'html_url'> & { owner: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'avatar_url'>)> }) } & (VoteButtonsFragment & RepoInfoFragment));

import gql from 'graphql-tag';
import { VoteButtonsFragmentDoc } from './vote-buttons.fragment.generated';
import { RepoInfoFragmentDoc } from './repo-info.fragment.generated';
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
${RepoInfoFragmentDoc}`;
