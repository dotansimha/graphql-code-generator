import { RepoInfoFragment } from './repo-info.fragment.generated';
import { VoteButtonsFragment } from './vote-buttons.fragment.generated';
import * as Types from '../types';

type Maybe<T> = T | null;

export type FeedEntryFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'id' | 'commentCount'> & { repository: ({ __typename?: 'Repository' } & Pick<Types.Repository, 'full_name' | 'html_url'> & { owner: Maybe<({ __typename?: 'User' } & Pick<Types.User, 'avatar_url'>)> }) } & (VoteButtonsFragment & RepoInfoFragment));
