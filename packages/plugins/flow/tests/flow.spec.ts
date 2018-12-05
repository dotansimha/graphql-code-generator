import 'graphql-codegen-core/dist/testing';
import { parse, visit } from 'graphql';
import { FlowCommonVisitor } from '../src/visitor';

describe('Flow Plugin', () => {
  const SCALARS = {};

  describe('Enum', () => {
    it('Should build basic enum correctly', () => {
      const ast = parse(`enum MyEnum { A, B, C }`);
      const result = visit(ast, {
        leave: new FlowCommonVisitor({ namingConvention: null, scalars: SCALARS, enumValues: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
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
      const result = visit(ast, {
        leave: new FlowCommonVisitor({
          namingConvention: null,
          scalars: SCALARS,
          enumValues: { A: 'SomeValue', B: 'TEST' }
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export const MyEnumValues = {
          A = 'SomeValue',
          B = 'TEST',
          C = 'C'
        };

        export type MyEnum = $Values<typeof MyEnumValues>;
      `);
    });
  });

  describe('Scalar', () => {
    it('Should build basic scalar correctly as any', () => {
      const ast = parse(`scalar A`);
      const result = visit(ast, {
        leave: new FlowCommonVisitor({ namingConvention: null, scalars: SCALARS, enumValues: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type A = any;
      `);
    });

    it('Should build enum correctly with custom values', () => {
      const ast = parse(`scalar A`);
      const result = visit(ast, {
        leave: new FlowCommonVisitor({
          namingConvention: null,
          scalars: {
            ...SCALARS,
            A: 'MyCustomType'
          },
          enumValues: {}
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type A = MyCustomType;
      `);
    });
  });

  describe('Input Object', () => {
    it('Should build input types correctly, also with array, mutlti-dimensional arrays, non-null and custom types', () => {
      const ast = parse(`
        type MyType {
          foo: String
        }

        input MyInput {
          a: String!
          b: Int
          c: MyType
          d: MyType!
          e: [String]
          f: [String]!
          g: [String!]!
          h: [String!]
          i: [[String]]
          j: [[[String]]]
          k: [[String]]!
          l: [[String!]!]!
        }`);
      const result = visit(ast, {
        leave: new FlowCommonVisitor({
          namingConvention: null,
          scalars: { String: 'string', Int: 'number' },
          enumValues: {}
        })
      });

      expect(result.definitions[1]).toBeSimilarStringTo(`
        export type MyInput = {
          a: string,
          b: ?number,
          c: ?MyType,
          d: MyType,
          e: ?Array<?string>,
          f: Array<?string>,
          g: Array<string>,
          h: ?Array<string>,
          i: ?Array<?Array<?string>>,
          j: ?Array<?Array<?Array<?string>>>,
          k: Array<?Array<?string>>,
          l: Array<Array<string>>,
        };
      `);
    });
  });

  describe('Object', () => {
    it('Should build type correctly', () => {
      const ast = parse(`
        type MyType {
          foo: String
          bar: String!
        }`);
      const result = visit(ast, {
        leave: new FlowCommonVisitor({
          namingConvention: null,
          scalars: { String: 'string' },
          enumValues: {}
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyType = {
          foo: ?string,
          bar: string,
        };
      `);
    });

    it('Should build type correctly when implementing interface', () => {
      const ast = parse(`
        interface MyInterface {
          foo: String!
        }

        type MyType implements MyInterface {
          foo: String!
        }
        `);
      const result = visit(ast, {
        leave: new FlowCommonVisitor({
          namingConvention: null,
          scalars: { String: 'string' },
          enumValues: {}
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: string,
        };
      `);
      expect(result.definitions[1]).toBeSimilarStringTo(`
        export type MyType = MyInterface & {
          foo: string,
        };
      `);
    });

    it('Should build type correctly when implementing multiple interfaces', () => {
      const ast = parse(`
        interface MyInterface {
          foo: String!
        }

        interface MyOtherInterface {
          bar: String!
        }

        type MyType implements MyInterface & MyOtherInterface {
          foo: String!
          bar: String!
        }
        `);
      const result = visit(ast, {
        leave: new FlowCommonVisitor({
          namingConvention: null,
          scalars: { String: 'string' },
          enumValues: {}
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: string,
        };
      `);
      expect(result.definitions[1]).toBeSimilarStringTo(`
        export type MyOtherInterface = {
          bar: string,
        };
      `);
      expect(result.definitions[2]).toBeSimilarStringTo(`
        export type MyType = MyInterface & MyOtherInterface & {
          foo: string,
          bar: string,
        };
      `);
    });

    it('Should build type correctly with links between types', () => {
      const ast = parse(`
        type MyType {
          foo: MyOtherType!
        }
        
        type MyOtherType {
          bar: String!
        }
        `);
      const result = visit(ast, {
        leave: new FlowCommonVisitor({
          namingConvention: null,
          scalars: { String: 'string' },
          enumValues: {}
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyType = {
          foo: MyOtherType,
        };
      `);
      expect(result.definitions[1]).toBeSimilarStringTo(`
        export type MyOtherType = {
          bar: string,
        };
      `);
    });
  });

  describe('Interface', () => {
    it('Should build interface correctly', () => {
      const ast = parse(`
        interface MyInterface {
          foo: String
          bar: String!
        }`);
      const result = visit(ast, {
        leave: new FlowCommonVisitor({
          namingConvention: null,
          scalars: { String: 'string' },
          enumValues: {}
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: ?string,
          bar: string,
        };
      `);
    });
  });
});
