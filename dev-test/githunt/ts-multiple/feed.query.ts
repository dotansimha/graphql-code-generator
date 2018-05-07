import { FeedType } from './feedtype.enum';
import { FeedEntry } from './feedentry.fragment';
export namespace Feed {
  export type Variables = {
    type: FeedType;
    offset?: number | null;
    limit?: number | null;
  };

  export type Query = {
    __typename?: 'Query';
    currentUser?: CurrentUser | null;
    feed?: (Feed | null)[] | null;
  };

  export type CurrentUser = {
    __typename?: 'User';
    login: string;
  };

  export type Feed = FeedEntry.Fragment;
}
