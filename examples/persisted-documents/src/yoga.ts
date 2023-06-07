import { createSchema, createYoga, type Plugin } from 'graphql-yoga';
import { usePersistedOperations } from '@graphql-yoga/plugin-persisted-operations';

const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello: String!
    }

    type Mutation {
      echo(message: String!): String!
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'Hello world!',
    },
    Mutation: {
      echo: (_, args) => args.message,
    },
  },
});

export function makeYoga(args: { persistedDocuments: null | Map<string, string> }) {
  const plugins: Array<Plugin<any, any, any>> = [];
  if (args.persistedDocuments !== null) {
    const { persistedDocuments } = args;
    plugins.push(
      usePersistedOperations({
        getPersistedOperation: hash => persistedDocuments.get(hash),
      })
    );
  }
  return createYoga({
    schema,
    plugins,
  });
}
