/* eslint-disable */
import * as Types from '../gql/__generated__/types';

import gql from 'graphql-tag';
export type ComponentB_TypeBFragment = { __typename?: 'TypeB' } & Pick<Types.TypeB, 'param1' | 'param2'>;

export type ComponentB_TypeAFragment = { __typename?: 'TypeA' } & Pick<Types.TypeA, 'field3' | 'field4' | 'field5' | 'field6'> & { field7: Types.Maybe<{ __typename?: 'TypeB' } & ComponentB_TypeBFragment> };
export const ComponentB_TypeBFragmentDoc = gql`
  fragment ComponentB_TypeB on TypeB {
    param1
    param2
  }
`;
export const ComponentB_TypeAFragmentDoc = gql`
  fragment ComponentB_TypeA on TypeA {
    field3
    field4
    field5
    field6
    field7 {
      ...ComponentB_TypeB
    }
  }
  ${ComponentB_TypeBFragmentDoc}
`;
