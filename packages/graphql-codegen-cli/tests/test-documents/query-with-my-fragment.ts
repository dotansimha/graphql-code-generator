import gql from 'graphql-tag';
import { myFragment, myFragment2, myFragment3 } from './my-fragment';

export const query = gql`
  query myQuery($a: String) {
    fieldA(a: $a)
    fieldB {
      ...MyFragment
    }
  }
  ${myFragment}
`;

export const query2 = gql`
  query myQuery2 {
    fieldC {
      item {
        ...MyFragment2
        ...MyFragment3
      }
    }
  }
  ${myFragment2}
  ${myFragment3}
`;
