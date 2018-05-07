import { Episode } from './episode.enum';
export namespace HeroAndFriendsNames {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';
    name: string;
    friends?: (Friends | null)[] | null;
  };

  export type Friends = {
    __typename?: 'Character';
    name: string;
  };
}
