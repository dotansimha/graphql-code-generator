import { Episode } from './episode.enum';
export namespace HeroAppearsIn {
  export type Variables = {
  }

  export type Query = {
    hero: Hero | null; 
  } 

  export type Hero = {
    name: string; 
    appearsIn: Episode[]; 
  }
}
