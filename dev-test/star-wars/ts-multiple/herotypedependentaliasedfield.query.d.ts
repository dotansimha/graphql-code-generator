import { Episode } from './episode.enum';
export namespace HeroTypeDependentAliasedField {
  export type Variables = {
    episode?: Episode | null;
  }

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null; 
  }

  export type Hero =HumanInlineFragment | DroidInlineFragment

  export type HumanInlineFragment = {
    __typename?: "Human";
    property?: string | null; 
  }

  export type DroidInlineFragment = {
    __typename?: "Droid";
    property?: string | null; 
  }
}
