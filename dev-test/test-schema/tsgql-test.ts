import { typeDefs, ResolversOf } from './tsgql';

const sdl = typeDefs(/* GraphQL */ `
  type Query {
    foo: String!
  }
`);

export const resolvers: ResolversOf<typeof sdl> = {
  Query: {
    foo: () => 'test',
    goo2: () => 'test2',
  },
};
