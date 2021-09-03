import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index';

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
});
