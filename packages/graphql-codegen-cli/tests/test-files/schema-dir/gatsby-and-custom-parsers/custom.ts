import { parser } from 'custom-graphql-parser';

export const typeDefs = parser`
  type Query {
    book: Book
  }

  type Book {
    """
    Used custom parser
    """
    a: String
  }
`;
