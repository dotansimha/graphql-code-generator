import 'graphql-codegen-core/dist/testing';
import { parse } from 'graphql';
import { flowCommonPluginLeaveHandler } from '../src/visitor';

describe('Flow Common Plugin', () => {
  describe('Enum Type', () => {
    const convert = (str: string) => str;

    it('Should build basic enum correctly', () => {
      const ast = parse(`enum MyEnum { A, B, C }`);
      const result = flowCommonPluginLeaveHandler({ convert }).EnumTypeDefinition(ast.definitions[0] as any);

      expect(result).toBeSimilarStringTo(`
        export const MyEnumValues = {
          A = 'A',
          B = 'B',
          C = 'C'
        };
        
        export type MyEnum = $Values<typeof MyEnumValues>;
      `);
    });
  });
});
