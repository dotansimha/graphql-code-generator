import '@graphql-codegen/testing';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';

describe('urql graphcache', () => {
  it('Should output the cache-generic correctly', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        todos: [Todo]
      }

      type Mutation {
        toggleTodo(id: ID!): Todo!
        toggleTodos(id: [ID!]!): [Todo!]!
        toggleTodosOptionalArray(id: [ID!]!): [Todo!]
        toggleTodosOptionalEntity(id: [ID!]!): [Todo]!
        toggleTodosOptional(id: [ID!]!): [Todo]
      }

      type Author {
        id: ID
        name: String
        friends: [Author]
        friendsPaginated(from: Int!, limit: Int!): [Author]
      }

      type Todo {
        id: ID
        text: String
        complete: Boolean
        author: Author
      }
    `);
    const result = mergeOutputs([await plugin(schema, [], {})]);
    expect(result).toMatchSnapshot();
  });

  it('Should output the cache-generic correctly (with unions)', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        media: [Media]
      }

      type Mutation {
        updateMedia(id: ID!): Media
      }

      union Media = Book | Movie

      type Book {
        id: ID
        title: String
        pages: Int
      }

      type Movie {
        id: ID
        title: String
        duration: Int
      }
    `);
    const result = mergeOutputs([await plugin(schema, [], {})]);
    expect(result).toMatchSnapshot();
  });

  it('Should output the cache-generic correctly (with interfaces)', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        schoolBooks: [CoolBook]
      }

      type Author {
        id: ID
        name: String
        friends: [Author]
        friendsPaginated(from: Int!, limit: Int!): [Author]
      }

      type Todo {
        id: ID
        text: String
        complete: Boolean
        author: Author
      }

      interface CoolBook {
        id: ID
        title: String
        author: Author
      }

      type Textbook implements CoolBook {
        id: ID
        title: String
        author: Author
        todo: Todo
      }
    `);
    const result = mergeOutputs([await plugin(schema, [], {})]);
    expect(result).toMatchSnapshot();
  });

  it('Should output the cache-generic correctly (with typesPrefix and typesSuffix)', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        todos: [Todo]
      }

      type Mutation {
        toggleTodo(id: ID!): Todo!
        toggleTodos(id: [ID!]!): [Todo!]!
        toggleTodosOptionalArray(id: [ID!]!): [Todo!]
        toggleTodosOptionalEntity(id: [ID!]!): [Todo]!
        toggleTodosOptional(id: [ID!]!): [Todo]
      }

      type Author {
        id: ID
        name: String
        friends: [Author]
        friendsPaginated(from: Int!, limit: Int!): [Author]
      }

      type Todo {
        id: ID
        text: String
        complete: Boolean
        author: Author
      }
    `);
    const result = mergeOutputs([await plugin(schema, [], { typesPrefix: 'Prefix', typesSuffix: 'Suffix' })]);
    expect(result).toMatchSnapshot();
  });

  it('should emit type imports if useTypeImports config value is used', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        todos: [Todo]
      }

      type Mutation {
        toggleTodo(id: ID!): Todo!
        toggleTodos(id: [ID!]!): [Todo!]!
        toggleTodosOptionalArray(id: [ID!]!): [Todo!]
        toggleTodosOptionalEntity(id: [ID!]!): [Todo]!
        toggleTodosOptional(id: [ID!]!): [Todo]
      }

      type Author {
        id: ID
        name: String
        friends: [Author]
        friendsPaginated(from: Int!, limit: Int!): [Author]
      }

      type Todo {
        id: ID
        text: String
        complete: Boolean
        author: Author
      }
    `);
    const result = mergeOutputs([await plugin(schema, [], { useTypeImports: true })]);

    expect(result).toBeSimilarStringTo(
      `import type { Resolver as GraphCacheResolver, UpdateResolver as GraphCacheUpdateResolver, OptimisticMutationResolver as GraphCacheOptimisticMutationResolver, StorageAdapter as GraphCacheStorageAdapter } from '@urql/exchange-graphcache';
import type { IntrospectionData } from '@urql/exchange-graphcache/dist/types/ast';`
    );
  });

  it('Should correctly name GraphCacheResolvers & GraphCacheOptimisticUpdaters with nonstandard mutationType names', async () => {
    const schema = buildSchema(/* GraphQL */ `
      schema {
        query: Query_Root
        mutation: Mutation_Root
      }

      type Query_Root {
        todos: [Todo]
      }

      type Mutation_Root {
        toggleTodo(id: ID!): Todo!
      }

      type Todo {
        id: ID
        text: String
        complete: Boolean
      }
    `);
    const result = mergeOutputs([await plugin(schema, [], {})]);
    expect(result).toMatchSnapshot();
  });

  it('Should correctly output GraphCacheOptimisticUpdaters when there are no mutations', async () => {
    const schema = buildSchema(/* GraphQL */ `
      schema {
        query: Query_Root
      }

      type Query_Root {
        todos: [Todo]
      }

      type Todo {
        id: ID
        text: String
        complete: Boolean
      }
    `);
    const result = mergeOutputs([await plugin(schema, [], {})]);
    expect(result).toMatchSnapshot();
  });
});
