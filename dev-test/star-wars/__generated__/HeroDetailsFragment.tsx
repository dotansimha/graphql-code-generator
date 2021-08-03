import * as Types from '../types.d';

import { gql } from '@apollo/client';
export type HeroDetails_Droid_Fragment = { __typename?: 'Droid'; primaryFunction?: Types.Maybe<string>; name: string };

export type HeroDetails_Human_Fragment = { __typename?: 'Human'; height?: Types.Maybe<number>; name: string };

export type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

export const HeroDetailsFragmentDoc = gql`
  fragment HeroDetails on Character {
    name
    ... on Human {
      height
    }
    ... on Droid {
      primaryFunction
    }
  }
`;
