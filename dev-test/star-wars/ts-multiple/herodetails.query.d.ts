import { Episode } from './episode.enum';
export namespace HeroDetails {
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
    height: number | null; 
  }

  export type DroidInlineFragment = {
    primaryFunction: string | null; 
  }
}
