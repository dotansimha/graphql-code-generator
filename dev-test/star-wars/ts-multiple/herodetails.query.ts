import { Episode } from './episode.enum';
export namespace HeroDetails {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: HumanInlineFragment['__typename'] | DroidInlineFragment['__typename'];
    name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: 'Human';
    height?: number | null;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';
    primaryFunction?: string | null;
  };
}
