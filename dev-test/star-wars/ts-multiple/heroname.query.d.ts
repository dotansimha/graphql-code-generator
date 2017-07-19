import { Episode } from './episode.enum';
export namespace HeroName {
  export type Variables = {
    episode: Episode | null;
  }

  export type Query = {
    hero: Hero | null; 
  } 

  export type Hero = {
    name: string; 
  }
}
