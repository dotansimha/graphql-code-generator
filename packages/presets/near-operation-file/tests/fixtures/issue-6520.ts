import gql from 'graphql-tag';

export const userFields = gql`
  fragment userFields on User {
    email
    username
  }
`;

export const userQuery = gql`
  query UserQuery {
    user(id: "123") {
      id
      ...userFields
    }
  }
`;
