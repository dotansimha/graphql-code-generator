export namespace CurrentUserForProfile {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';
    currentUser?: CurrentUser | null;
  };

  export type CurrentUser = {
    __typename?: 'User';
    login: string;
    avatar_url: string;
  };
}
