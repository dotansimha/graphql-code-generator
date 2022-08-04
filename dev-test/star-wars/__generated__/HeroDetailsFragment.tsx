import * as Types from '../types.d.js';

import { gql } from '@apollo/client';
export type HeroDetails_Droid_Fragment = { __typename?: 'Droid'; primaryFunction?: string | null; name: string };

export type HeroDetails_Human_Fragment = { __typename?: 'Human'; height?: number | null; name: string };

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
