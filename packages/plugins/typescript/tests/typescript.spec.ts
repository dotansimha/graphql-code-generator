import 'graphql-codegen-core/dist/testing';
import { parse, visit, buildSchema } from 'graphql';
import { TsVisitor } from '../src/visitor';
import { validateTs } from './validate';
import { plugin } from '../src/index';

describe('TypeScript', () => {
  describe('Config', () => {
    it('Should build type correctly when specified with avoidOptionals config', async () => {
      const schema = buildSchema(`
        type MyType {
          foo: String
          bar: String!
        }`);
      const result = await plugin(schema, [], { avoidOptionals: true }, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyType = {
          foo: Maybe<string>,
          bar: string,
        };
      `);
      validateTs(result);
    });
  });

  describe('Object (type)', () => {
    it('Should build type correctly', async () => {
      const schema = buildSchema(`
        type MyType {
          foo: String
          bar: String!
        }`);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyType = {
          foo?: Maybe<string>,
          bar: string,
        };
      `);
      validateTs(result);
    });

    it('Should build type correctly when implementing interface', async () => {
      const schema = buildSchema(`
        interface MyInterface {
          foo: String!
        }

        type MyType implements MyInterface {
          foo: String!
        }
        `);
      const result = await plugin(schema, [], { avoidOptionals: true }, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: string,
        };
      `);
      expect(result).toBeSimilarStringTo(`
        export type MyType = MyInterface & {
          foo: string,
        };
      `);
      validateTs(result);
    });
  });
});
