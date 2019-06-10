import * as Types from './common.d';

import { FeedEntryFragment } from './feed-entry.fragment.types.d';
export type FeedQueryVariables = {
  type: Types.FeedType,
  offset?: Types.Maybe<Types.Scalars['Int']>,
  limit?: Types.Maybe<Types.Scalars['Int']>
};


export type FeedQuery = ({ __typename?: 'Query' } & { currentUser: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login'>)>, feed: Types.Maybe<Array<Types.Maybe<({ __typename?: 'Entry' } & FeedEntryFragment)>>> });
