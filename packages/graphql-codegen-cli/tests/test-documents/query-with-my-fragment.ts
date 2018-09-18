import gql from 'graphql-tag';
import { myFragment } from './my-fragment';

export const query = gql`
  query myQuery {
    fieldA
    fieldB {
      ...MyFragment
    }
  }
  ${myFragment}
`;
