import { FriendsEdge } from './friendsedge.type';
import { Character } from './character.interface';
import { PageInfo } from './pageinfo.type';
/* A connection object for a character&#x27;s friends */
export interface FriendsConnection {
  totalCount?: number | null; /* The total number of friends */
  edges?: FriendsEdge[] | null; /* The edges for each of the character&#x27;s friends. */
  friends?: Character[] | null; /* A list of the friends, as a convenience when edges are not needed. */
  pageInfo: PageInfo; /* Information for paginating this connection */
}

