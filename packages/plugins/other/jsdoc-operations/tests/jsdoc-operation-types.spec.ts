import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index';

describe('JSDoc Operations Plugin', () => {
  describe('operation types', () => {
    it('should generate a typedef based on a simple query', async () => {
      const schema = buildSchema(/* Graphql */ `
        type Bar {
            id: ID!
        }

        type Query {
            foo: Int!
            bar: Bar!
        }
    `);

      const ast = parse(/* GraphQL */ `
        query getFoo {
          foo
          bar {
            id
          }
        }
      `);

      const config = {};
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toEqual(
        expect.stringContaining(`/**
 * @typedef {Object} GetFooQueryBar
 * @property {Query.bar.bar} bar
 */`)
      );

      expect(result).toEqual(
        expect.stringContaining(`/**
 * @typedef {Object} GetFooQuery
 * @property {Query.foo} foo
 * @property {GetFooQueryBar} bar
 */`)
      );
    });
  });
});
