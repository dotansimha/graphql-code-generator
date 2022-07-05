import '@graphql-codegen/testing';
import { Types } from '@graphql-codegen/plugin-helpers';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript', () => {
  describe('with importFrom', () => {
    it('Should work', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is a"
          A
          "this is b"
          B
        }
      `);
      const result = (await plugin(schema, [], { importFrom: './generated-types' })) as Types.ComplexPluginOutput;

      expect(result.prepend).toBeSimilarStringTo(`
        import { MyEnum } from "./generated-types";
      `);
      expect(result.content).toBeSimilarStringTo(`
        const MY_ENUM: MyEnum[] = ['A', 'B'];
      `);
    });
  });
  describe('without importFrom', () => {
    it('Should work', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is a"
          A
          "this is b"
          B
        }
      `);
      const result = (await plugin(schema, [], {})) as Types.ComplexPluginOutput;

      expect(result.prepend).toBeSimilarStringTo(`
      `);
      expect(result.content).toBeSimilarStringTo(`
        const MY_ENUM: MyEnum[] = ['A', 'B'];
      `);
    });
  });
});
