import { createYoga, createSchema } from 'graphql-yoga';
import { createServer } from 'http';
import type { Resolvers } from './type-defs.d';

const typeDefs = /* GraphQL */ `
  type Query {
    hello: String!
  }

  input SumInput {
    a: Float!
    b: Float!
  }

  type Mutation {
    echoString(str: String!): String!
    calculateSum(input: SumInput!): Float!
  }
`;

const resolvers: Resolvers = {
  Query: {
    hello: () => 'world',
  },
  Mutation: {
    echoString: (_, args) => {
      return args.str;
    },
    calculateSum: (_, args) => {
      return args.input.a + args.input.b;
    },
  },
};

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
});

const server = createServer(yoga);

server.listen(3000);
