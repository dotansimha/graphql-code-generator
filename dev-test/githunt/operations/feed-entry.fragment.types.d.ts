import * as Types from './common.d';

export type FeedEntryFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'id' | 'commentCount'> & { repository: ({ __typename?: 'Repository' } & Pick<Types.Repository, 'full_name' | 'html_url'> & { owner: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'avatar_url'>)> }) });
