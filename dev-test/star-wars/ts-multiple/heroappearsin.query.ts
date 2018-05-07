import { Episode } from './episode.enum';
export namespace HeroAppearsIn {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';
    name: string;
    appearsIn: (Episode | null)[];
  };
}
