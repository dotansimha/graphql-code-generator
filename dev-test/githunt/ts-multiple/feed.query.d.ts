import { FeedType } from './feedtype.enum';
import { FeedEntry } from './feedentry.fragment';
export namespace Feed {
  export type Variables = {
    type: FeedType;
    offset?: number;
    limit?: number;
  }

  export type Query = {
    currentUser?: CurrentUser; 
    feed?: Feed[]; 
  } 

  export type CurrentUser = {
    login: string; 
  } 

  export type Feed = FeedEntry.Fragment
}
