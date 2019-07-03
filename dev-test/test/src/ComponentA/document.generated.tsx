/* eslint-disable */
import * as Types from '../gql/__generated__/types';

import gql from 'graphql-tag';
export type ComponentA_TypeAFragment = { __typename?: 'TypeA' } & Pick<Types.TypeA, 'field1'>;
export const ComponentA_TypeAFragmentDoc = gql`
  fragment ComponentA_TypeA on TypeA {
    field1
  }
`;
