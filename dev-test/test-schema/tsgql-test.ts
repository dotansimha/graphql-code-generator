import { typeDefs, ResolversOf } from './tsgql';

const sdl1 = typeDefs(/* GraphQL */ `
  type Query {
    foo: String!
  }

  extend type User {
    age: Int!
  }
`);

export const resolvers1: ResolversOf<typeof sdl1> = {};

const sdl2 = typeDefs(/* GraphQL */ `
  type Mutation {
    doSomething: SomeResult!
  }

  type SomeResult {
    changed: User!
  }

  type User {
    id: String
    name: String
  }
`);

export const resolvers2: ResolversOf<typeof sdl2> = {};
