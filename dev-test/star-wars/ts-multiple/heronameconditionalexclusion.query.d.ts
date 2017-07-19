import { Episode } from './episode.enum';
export namespace HeroNameConditionalExclusion {
  export type Variables = {
    episode: Episode | null;
    skipName: boolean;
  }

  export type Query = {
    hero: Hero | null; 
  } 

  export type Hero = {
    name: string; 
  }
}
