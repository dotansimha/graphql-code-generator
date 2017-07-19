import { Episode } from './episode.enum';
export namespace HeroTypeDependentAliasedField {
  export type Variables = {
    episode: Episode | null;
  }

  export type Query = {
    hero: Hero | null; 
  } 

  export type Hero = {
  } & HumanInlineFragment & DroidInlineFragment

  export type HumanInlineFragment = {
    property: string | null; 
  }

  export type DroidInlineFragment = {
    property: string | null; 
  }
}
