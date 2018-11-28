import gql from 'graphql-tag';
import { myFragment } from './my-fragment';

export const query = gql`
  query myQuery($a: String) {
    fieldA(a: $a)
    fieldB {
      ...MyFragment
    }
  }
  ${myFragment}
`;
