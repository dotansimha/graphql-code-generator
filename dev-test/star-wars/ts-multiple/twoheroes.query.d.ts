export namespace TwoHeroes {
  export type Variables = {
  }

  export type Query = {
    __typename?: "Query";
    r2?: R2 | null; 
    luke?: Luke | null; 
  }

  export type R2 = {
    __typename?: "Character";
    name: string; 
  }

  export type Luke = {
    __typename?: "Character";
    name: string; 
  }
}
