import { typeDefs } from 'tsgql';

const sdl = typeDefs(/* GraphQL */ `
  type Query {
    foo: String!
  }
`);

export const resolvers: typeof sdl = {
  Query: {
    foo: () => 'test',
  },
};
