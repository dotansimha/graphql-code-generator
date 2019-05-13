import * as Types from '../types';

import { RepoInfoFragment } from './repo-info.fragment.generated';
import { VoteButtonsFragment } from './vote-buttons.fragment.generated';
export type FeedEntryFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'id' | 'commentCount'> & { repository: Types.Maybe<({ __typename?: 'Repository' } & Pick<Types.Repository, 'full_name' | 'html_url'> & { owner: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'avatar_url'>)> })> } & (VoteButtonsFragment & RepoInfoFragment));
