import * as Types from '../types.d';

import { gql } from '@apollo/client';
export type HeroDetails_Droid_Fragment = { __typename?: 'Droid' } & Pick<Types.Droid, 'primaryFunction' | 'name'>;

export type HeroDetails_Human_Fragment = { __typename?: 'Human' } & Pick<Types.Human, 'height' | 'name'>;

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
