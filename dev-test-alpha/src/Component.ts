import { useQuery, gql } from '@apollo/client';
import Helper from './Helper';

export const getFooQuery = gql`
  ${Helper.fragments.query}
  query GetFoo($alias: String!, $collectionId: String!) {
    superUser {
      squadFromAlias(alias: $alias) {
        managers(onlyPublic: true) {
          ...HelperFields
        }
      }
    }
  }
`;

const Component = () => {
  useQuery(getFooQuery, {});
};

export default Component;
