import { Episode } from './episode.enum';
export namespace HeroParentTypeDependentField {
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
    friends?: (Friends | null)[] | null;
  };

  export type Friends = {
    __typename?: _HumanInlineFragment['__typename'];
    name: string;
  } & (_HumanInlineFragment);

  export type _HumanInlineFragment = {
    __typename?: 'Human';
    height?: number | null;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';
    friends?: (_Friends | null)[] | null;
  };

  export type _Friends = {
    __typename?: __HumanInlineFragment['__typename'];
    name: string;
  } & (__HumanInlineFragment);

  export type __HumanInlineFragment = {
    __typename?: 'Human';
    height?: number | null;
  };
}
