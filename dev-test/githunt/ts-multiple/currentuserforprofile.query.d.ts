export namespace CurrentUserForProfile {
  export type Variables = {
  }

  export type Query = {
    currentUser?: CurrentUser; 
  } 

  export type CurrentUser = {
    login: string; 
    avatar_url: string; 
  } 
}
