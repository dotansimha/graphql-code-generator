import { Episode } from './episode.enum';
export namespace HeroNameConditionalInclusion {
  export type Variables = {
    episode?: Episode | null;
    includeName: boolean;
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
