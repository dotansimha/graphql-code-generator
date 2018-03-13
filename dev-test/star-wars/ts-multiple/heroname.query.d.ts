import { Episode } from './episode.enum';
export namespace HeroName {
  export type Variables = {
    episode?: Episode | null;
  }

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null; 
  }

  export type Hero = {
    __typename?: "Character";
    name: string; 
  }
}
