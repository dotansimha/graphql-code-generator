import { Episode } from './episode.enum';
import { HeroDetails } from './herodetails.fragment';
export namespace HeroDetailsWithFragment {
  export type Variables = {
    episode?: Episode | null;
  }

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null; 
  }

  export type Hero =HeroDetails.Fragment
}
