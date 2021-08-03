import * as Types from '../types.d';

import { gql } from '@apollo/client';
export type HumanFieldsFragment = { __typename?: 'Human'; name: string; mass?: Types.Maybe<number> };

export const HumanFieldsFragmentDoc = gql`
  fragment HumanFields on Human {
    name
    mass
  }
`;
