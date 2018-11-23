import 'graphql-codegen-core/dist/testing';
import { parse } from 'graphql';
import { flowCommonPluginLeaveHandler } from '../src/visitor';

describe('Flow Common Plugin', () => {
  describe('Enum Type', () => {
    const convert = (str: string) => str;
    const SCALARS = {};

    it('Should build basic enum correctly', () => {
      const ast = parse(`enum MyEnum { A, B, C }`);
      const result = flowCommonPluginLeaveHandler({ convert, scalars: SCALARS, enumValues: {} }).EnumTypeDefinition(ast
        .definitions[0] as any);

      expect(result).toBeSimilarStringTo(`
        export const MyEnumValues = {
          A = 'A',
          B = 'B',
          C = 'C'
        };

        export type MyEnum = $Values<typeof MyEnumValues>;
      `);
    });

    it('Should build enum correctly with custom values', () => {
      const ast = parse(`enum MyEnum { A, B, C }`);
      const result = flowCommonPluginLeaveHandler({
        convert,
        scalars: SCALARS,
        enumValues: { A: 'SomeValue', B: 'TEST' }
      }).EnumTypeDefinition(ast.definitions[0] as any);

      expect(result).toBeSimilarStringTo(`
        export const MyEnumValues = {
          A = 'SomeValue',
          B = 'TEST',
          C = 'C'
        };

        export type MyEnum = $Values<typeof MyEnumValues>;
      `);
    });
  });
});
