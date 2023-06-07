import { createSchema, createYoga } from 'graphql-yoga';
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream';
import { createServer } from 'node:http';

const typeDefs = /* GraphQL */ `
  type Query {
    alphabet: [String!]!
    """
    A field that resolves fast.
    """
    fastField: String!

    """
    A field that resolves slowly.
    Maybe you want to @defer this field ;)
    """
    slowField(waitFor: Int! = 5000): String!
  }
`;

const wait = time => new Promise(resolve => setTimeout(resolve, time));

const resolvers = {
  Query: {
    async *alphabet() {
      for (const character of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
        yield character;
        await wait(1000);
      }
    },
    fastField: async () => {
      await wait(100);
      return 'I am speed';
    },
    slowField: async (_, { waitFor }) => {
      await wait(waitFor);
      return 'I am slow';
    },
  },
};

export const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  plugins: [useDeferStream()],
});

const server = createServer(yoga);

server.listen(4000, () => {
  // eslint-disable-next-line no-console
  console.info('Server is running on http://localhost:4000/graphql');
});
