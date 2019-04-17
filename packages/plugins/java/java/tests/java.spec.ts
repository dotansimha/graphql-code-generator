import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index';
import { validateJava } from '../../java-common/tests/validate-java';

const OUTPUT_FILE = 'com/java/generated/resolvers.java';

describe('Java', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Query {
      me: User!
    }

    interface Node {
      id: ID!
    }

    type User implements Node {
      id: ID!
      username: String!
      email: String!
      name: String
    }

    type Chat implements Node {
      id: ID!
      users: [User!]!
      title: String
    }

    union SearchResult = Chat | User
  `);
});
