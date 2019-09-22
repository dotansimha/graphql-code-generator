import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    user: User
  }

  type User {
    """
    Used apollo-server
    """
    a: String
  }
`;
