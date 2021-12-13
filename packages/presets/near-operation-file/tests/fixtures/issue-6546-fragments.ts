import gql from 'graphql-tag';

export const usernameFragment = gql`
  fragment usernameFragment on User {
    username
  }
`;

export const userFields = gql`
  fragment userFields on User {
    ...usernameFragment
    email
  }

  ${usernameFragment}
`;
