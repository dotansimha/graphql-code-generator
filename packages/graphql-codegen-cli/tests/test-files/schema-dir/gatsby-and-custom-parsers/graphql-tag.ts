import gql from 'graphql-tag';

export const typeDefs = gql`
  type Query {
    user: User
  }

  type User {
    """
    Used graphql-tag
    """
    a: String
  }
`;
