/**
 * This file tests generating enum from external fragement from another file.
 * Check that `UserManagerRoleType` enum is generated in `__generated__/Component.ts`
 */

import { useQuery, gql } from '@apollo/client';
import Helper from './Helper';

export const getFooQuery = gql`
  ${Helper.fragments.query}
  query GetFoo($alias: String!, $collectionId: String!) {
    superUser {
      groupFromAlias(alias: $alias) {
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
