import { FeedEntryFragment } from './feed-entry.fragment.generated';
import * as Types from '../types';

type Maybe<T> = T | null;

export type FeedQueryVariables = {
  type: FeedType,
  offset?: Maybe<Types.Scalars['Int']>,
  limit?: Maybe<Types.Scalars['Int']>
};


export type FeedQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login'>)>, feed: Maybe<Array<Maybe<({ __typename?: 'Entry' } & FeedEntryFragment)>>> });
