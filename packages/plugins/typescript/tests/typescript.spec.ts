import 'graphql-codegen-core/dist/testing';
import { parse, visit } from 'graphql';
import { TsVisitor } from '../src/visitor';

describe('TypeScript', () => {
  describe('Object (type)', () => {
    it('Should build type correctly', () => {
      const ast = parse(`
        type MyType {
          foo: String
          bar: String!
        }`);
      const result = visit(ast, {
        leave: new TsVisitor({
          namingConvention: null,
          scalars: { String: 'string' },
          enumValues: {}
        }) as any
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyType = {
          foo?: string,
          bar: string,
        };
      `);
    });
  });
});
