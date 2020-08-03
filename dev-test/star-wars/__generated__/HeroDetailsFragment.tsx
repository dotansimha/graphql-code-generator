import * as Types from '../types.d';

export type HeroDetails_Human_Fragment = { __typename?: 'Human' } & Pick<Types.Human, 'height' | 'name'>;

export type HeroDetails_Droid_Fragment = { __typename?: 'Droid' } & Pick<Types.Droid, 'primaryFunction' | 'name'>;

export type HeroDetailsFragment = HeroDetails_Human_Fragment | HeroDetails_Droid_Fragment;

export const HeroDetailsFragmentDoc = Apollo.gql`
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
