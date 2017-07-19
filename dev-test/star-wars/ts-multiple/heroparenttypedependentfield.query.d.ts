import { Episode } from './episode.enum';
export namespace HeroParentTypeDependentField {
  export type Variables = {
    episode: Episode | null;
  }

  export type Query = {
    hero: Hero | null; 
  } 

  export type Hero = {
    name: string; 
  } & HumanInlineFragment & DroidInlineFragment

  export type HumanInlineFragment = {
    friends: Friends[] | null; 
  }

  export type Friends = {
    name: string; 
  } & _HumanInlineFragment

  export type _HumanInlineFragment = {
    height: number | null; 
  }

  export type DroidInlineFragment = {
    friends: _Friends[] | null; 
  }

  export type _Friends = {
    name: string; 
  } & __HumanInlineFragment

  export type __HumanInlineFragment = {
    height: number | null; 
  }
}
