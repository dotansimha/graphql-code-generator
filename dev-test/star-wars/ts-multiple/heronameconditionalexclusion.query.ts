import { Episode } from './episode.enum';
export namespace HeroNameConditionalExclusion {
  export type Variables = {
    episode?: Episode | null;
    skipName: boolean;
  };

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';
    name: string;
  };
}
