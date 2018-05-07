/** Information for paginating this connection */
export interface PageInfo {
  startCursor?: string | null;
  endCursor?: string | null;
  hasNextPage: boolean;
}
