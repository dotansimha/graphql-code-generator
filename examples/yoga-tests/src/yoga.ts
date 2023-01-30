import { createSchema, createYoga } from 'graphql-yoga';

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

export const yoga = createYoga({
  schema,
});
