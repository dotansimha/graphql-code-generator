import { buildSchema } from 'graphql';
import { plugin } from '../src/index';

describe('JSDoc Operations Plugin', () => {
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
      expect(result).toEqual(expect.stringContaining('@property {Array<(number|null|undefined)>} [nullableItemsNullableFoo]'));
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
  });
});
