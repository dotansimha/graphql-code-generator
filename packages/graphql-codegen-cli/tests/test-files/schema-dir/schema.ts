import gql from 'graphql-tag';

export const typeDefs = gql`
  type Query {
    user: User
  }

  type User {
    a: String
  }
`;
