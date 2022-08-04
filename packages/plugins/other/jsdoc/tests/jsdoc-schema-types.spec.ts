import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';

describe('JSDoc Plugin', () => {
  describe('description', () => {
    it('Should work with described schemas', async () => {
      const schema = buildSchema(/* Graphql */ `
        """type desc"""
        type Foo {
          """type field desc"""
            foo: Int!
        }

        """input desc"""
        input FooInput {
            """input field desc"""
            foo: Int!
        }

        """enum desc"""
        enum Test {
            A
            B
            """enum value desc"""
            C
        }

        """scalar desc"""
        scalar Date

        """interface desc"""
        interface Node {
          """ interface field desc """
          id: ID!
        }

        """
        union desc
        multiline test
        """
        union TestU = Foo
    `);

      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`/**
      * enum desc
      * @typedef {("A"|"B"|"C")} Test
      */`);
      expect(result).toBeSimilarStringTo(`/**
      * union desc
      * multiline test
      * @typedef {(Foo)} TestU
      */`);
      expect(result).toBeSimilarStringTo(`/**
      * scalar desc 
      * @typedef {*} Date
      */`);
      expect(result).toBeSimilarStringTo(`/**
      * input desc 
      * @typedef {Object} FooInput
      * @property {number} foo -  input field desc 
      */`);
      expect(result).toBeSimilarStringTo(`/**
      * type desc 
      * @typedef {Object} Foo
      * @property {number} foo -  type field desc 
      */`);
    });
  });

  describe('schema types', () => {
    it('should generate a typedef with a property', async () => {
      const schema = buildSchema(/* Graphql */ `
        type Foo {
            foo: Int!
        }
    `);

      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toEqual(
        expect.stringContaining(`/**
 * @typedef {Object} Foo
 * @property {number} foo
 */`)
      );
    });

    it('should generate a typedef with a nullable property', async () => {
      const schema = buildSchema(/* Graphql */ `
        type Foo {
            foo: Int
        }
    `);

      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toEqual(expect.stringContaining('@property {number} [foo]'));
    });

    it('should generate a typedef for an input type', async () => {
      const schema = buildSchema(/* Graphql */ `
        input FooInput {
            foo: Int!
        }
    `);

      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toEqual(
        expect.stringContaining(`/**
 * @typedef {Object} FooInput
 * @property {number} foo
 */`)
      );
    });

    it('should generate a typedef with a nullable property (input type)', async () => {
      const schema = buildSchema(/* Graphql */ `
        input FooInput {
            foo: Int
        }
    `);

      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toEqual(expect.stringContaining('@property {number} [foo]'));
    });

    it('should generate a typedef for a union', async () => {
      const schema = buildSchema(/* Graphql */ `
        union FooBar = Int | Boolean
    `);

      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toEqual(`/**
 * @typedef {(number|boolean)} FooBar
 */`);
    });

    it('should generate a typedef with a list property', async () => {
      const schema = buildSchema(/* Graphql */ `
        type Foo {
            foo: [Int!]!
            nullableFoo: [Int!]
            nullableItemsFoo: [Int]!
            nullableItemsNullableFoo: [Int]
        }
    `);

      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toEqual(expect.stringContaining('@property {Array<number>} foo'));
      expect(result).toEqual(expect.stringContaining('@property {Array<number>} [nullableFoo]'));
      expect(result).toEqual(expect.stringContaining('@property {Array<(number|null|undefined)>} nullableItemsFoo'));
      expect(result).toEqual(
        expect.stringContaining('@property {Array<(number|null|undefined)>} [nullableItemsNullableFoo]')
      );
    });

    it('should generate a typedef with a custom scalar', async () => {
      const schema = buildSchema(/* Graphql */ `
        scalar Bar

        type Foo {
            foo: Bar
        }
    `);

      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toEqual(expect.stringContaining('@typedef {*} Bar'));
      expect(result).toEqual(expect.stringContaining('@property {Bar} [foo]'));
    });

    it('should generate a typedef for enums', async () => {
      const schema = buildSchema(/* Graphql */ `
        enum FooOrBar {
            FOO
            BAR
        }
    `);

      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toEqual(expect.stringContaining('* @typedef {("FOO"|"BAR")} FooOrBar'));
    });

    it('should generate an annotation for deprecated fields', async () => {
      const warning = 'the field foo is no longer supported, prefer bar';
      const schema = buildSchema(/* Graphql */ `
        type Query {
            foo: String! @deprecated(reason: "${warning}")
            bar: String!
        }
    `);

      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toEqual(expect.stringContaining(`* @property {string} foo - DEPRECATED: ${warning}`));
    });

    it('should not generate [object Object] for directives', async () => {
      const schema = buildSchema(/* GraphQL */ `
        directive @client(always: Boolean) on FIELD | FRAGMENT_DEFINITION | INLINE_FRAGMENT
      `);

      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).not.toEqual(expect.stringContaining('[object Object]'));
    });

    it('should not generate [object Object] or extra lines for Schema', async () => {
      const schema = buildSchema(/* GraphQL */ `
        schema {
          query: RootQueryType
          mutation: RootMutationType
        }

        type RootMutationType {
          addItem(name: String!): String
        }

        type RootQueryType {
          items: [String!]!
        }
      `);
      const config = {};
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).not.toEqual(expect.stringContaining('[object Object]'));
      expect(result).toEqual(`/**
 * @typedef {Object} RootMutationType
 * @property {string} [addItem]
 */

/**
 * @typedef {Object} RootQueryType
 * @property {Array<string>} items
 */`);
    });
  });
});
