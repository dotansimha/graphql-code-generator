import gql from 'graphql-tag';
import { userFields, usernameFragment } from './issue-6546-fragments.js';

export const limitedUserFieldsQuery = gql`
  query user {
    user(id: "1") {
      ...usernameFragment
    }
  }

  ${usernameFragment}
`;

export const userAndFriendQuery = gql`
  query allUserFields {
    user(id: "1") {
      ...userFields
    }

    friend: user(id: "2") {
      ...usernameFragment
    }
  }

  ${userFields}
  ${usernameFragment}
`;
