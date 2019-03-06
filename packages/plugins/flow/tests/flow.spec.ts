import 'graphql-codegen-core/dist/testing';
import { parse, visit } from 'graphql';
import { FlowVisitor } from '../src/visitor';
import { validateFlow } from '../../flow-documents/tests/validate-flow';

describe('Flow Plugin', () => {
  const SCALARS = {};

  describe('Naming Convention & Types Prefix', () => {
    it('Should use custom namingConvention for type name and args typename', () => {
      const ast = parse(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = visit(ast, {
        leave: new FlowVisitor({ namingConvention: 'change-case#lowerCase' })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type mytypefooargs = {
          a: string,
          b?: ?string,
          c?: ?Array<?string>,
          d: Array<number>
        };
    `);
      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type mytype = {
          foo?: ?string,
        };
    `);

      validateFlow(result.definitions[0]);
    });

    it('Should use custom namingConvention and add custom prefix', () => {
      const ast = parse(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = visit(ast, {
        leave: new FlowVisitor({ namingConvention: 'change-case#lowerCase', typesPrefix: 'I' })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type Imytypefooargs = {
          a: string,
          b?: ?string,
          c?: ?Array<?string>,
          d: Array<number>
        };
      `);

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type Imytype = {
          foo?: ?string,
        };
      `);

      validateFlow(result.definitions[0]);
    });

    const ast = parse(`
    enum MyEnum {
      A
      B
      C
    }

    type MyType {
      f: String
      bar: MyEnum
      b_a_r: String
      myOtherField: String
    }

    type My_Type {
      linkTest: MyType
    }

    union MyUnion = My_Type | MyType

    interface Some_Interface {
      id: ID!
    }

    type Impl1 implements Some_Interface {
      id: ID!
    }

    type Impl_2 implements Some_Interface {
      id: ID!
    }

    type impl_3 implements Some_Interface {
      id: ID!
    }

    type Query {
      something: MyUnion
      use_interface: Some_Interface
    }
  `);

    it('Should generate correct values when using links between types - lowerCase', () => {
      const result = visit(ast, {
        leave: new FlowVisitor({ namingConvention: 'change-case#lowerCase' })
      }).definitions.join('\n');

      expect(result).toBeSimilarStringTo(`
        export const myenumvalues = Object.freeze({
          a: 'A',
          b: 'B',
          c: 'C'
        });
    
        export type myenum = $Values<typeof myenumvalues>;
    
        export type mytype = {
          f?: ?string,
          bar?: ?myenum,
          b_a_r?: ?string,
          myOtherField?: ?string,
        };
    
        export type my_type = {
          linkTest?: ?mytype,
        };
    
        export type myunion = my_type | mytype;
    
        export type some_interface = {
          id: string,
        };
    
        export type impl1 = some_interface & {
          id: string,
        };
    
        export type impl_2 = some_interface & {
          id: string,
        };
    
        export type impl_3 = some_interface & {
          id: string,
        };
    
        export type query = {
          something?: ?myunion,
          use_interface?: ?some_interface,
        };
      `);

      validateFlow(result);
    });

    it('Should generate correct values when using links between types - pascalCase (default)', () => {
      const result = visit(ast, {
        leave: new FlowVisitor({})
      }).definitions.join('\n');

      expect(result).toBeSimilarStringTo(`
      export const MyEnumValues = Object.freeze({
        A: 'A',
        B: 'B',
        C: 'C'
      });
  
      export type MyEnum = $Values<typeof MyEnumValues>;
  
      export type MyType = {
        f?: ?string,
        bar?: ?MyEnum,
        b_a_r?: ?string,
        myOtherField?: ?string,
      };
  
      export type My_Type = {
        linkTest?: ?MyType,
      };
  
      export type MyUnion = My_Type | MyType;
  
      export type Some_Interface = {
        id: string,
      };
  
      export type Impl1 = Some_Interface & {
        id: string,
      };
  
      export type Impl_2 = Some_Interface & {
        id: string,
      };
  
      export type Impl_3 = Some_Interface & {
        id: string,
      };
  
      export type Query = {
        something?: ?MyUnion,
        use_interface?: ?Some_Interface,
      };
      `);

      validateFlow(result);
    });

    it('Should generate correct values when using links between types - pascalCase (default) with custom prefix', () => {
      const result = visit(ast, {
        leave: new FlowVisitor({ typesPrefix: 'I' })
      }).definitions.join('\n');

      expect(result).toBeSimilarStringTo(`
      export const IMyEnumValues = Object.freeze({
        IA: 'A',
        IB: 'B',
        IC: 'C'
      });
  
      export type IMyEnum = $Values<typeof IMyEnumValues>;
  
      export type IMyType = {
        f?: ?string,
        bar?: ?IMyEnum,
        b_a_r?: ?string,
        myOtherField?: ?string,
      };
  
      export type IMy_Type = {
        linkTest?: ?IMyType,
      };
  
      export type IMyUnion = IMy_Type | IMyType;
  
      export type ISome_Interface = {
        id: string,
      };
  
      export type IImpl1 = ISome_Interface & {
        id: string,
      };
  
      export type IImpl_2 = ISome_Interface & {
        id: string,
      };
  
      export type IImpl_3 = ISome_Interface & {
        id: string,
      };
  
      export type IQuery = {
        something?: ?IMyUnion,
        use_interface?: ?ISome_Interface,
      };
      `);

      validateFlow(result);
    });
  });

  describe('Arguments', () => {
    it('Should generate correctly types for field arguments - with basic fields', () => {
      const ast = parse(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = visit(ast, {
        leave: new FlowVisitor({ namingConvention: null })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a: string,
          b?: ?string,
          c?: ?Array<?string>,
          d: Array<number>
        };
    `);

      validateFlow(result.definitions[0]);
    });

    it('Should generate correctly types for field arguments - with default value', () => {
      const ast = parse(`type MyType { foo(a: String = "default", b: String! = "default", c: String): String }`);
      const result = visit(ast, {
        leave: new FlowVisitor({ namingConvention: null })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a: string,
          b: string,
          c?: ?string
        };
    `);

      validateFlow(result.definitions[0]);
    });

    it('Should generate correctly types for field arguments - with input type', () => {
      const ast = parse(
        `input MyInput { f: String } type MyType { foo(a: MyInput, b: MyInput!, c: [MyInput], d: [MyInput]!, e: [MyInput!]!): String }`
      );
      const result = visit(ast, {
        leave: new FlowVisitor({ namingConvention: null })
      });

      expect(result.definitions[1]).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a?: ?MyInput,
          b: MyInput,
          c?: ?Array<?MyInput>,
          d: Array<?MyInput>,
          e: Array<MyInput>
        };
    `);

      validateFlow(result.definitions[0]);
      validateFlow(result.definitions[1]);
    });

    it('Should add custom prefix for mutation arguments', () => {
      const ast = parse(`input Input { name: String } type Mutation { foo(id: String, input: Input): String }`);
      const result = visit(ast, {
        leave: new FlowVisitor({ typesPrefix: 'T' })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type TInput = {
          name: ?string,
        };
      `);

      expect(result.definitions[1]).toBeSimilarStringTo(`
        export type TMutation = {
          foo?: ?string,
        };


        export type TMutationFooArgs = {
          id?: ?string,
          input?: ?TInput
        };
      `);

      validateFlow(result.definitions[0]);
      validateFlow(result.definitions[1]);
    });
  });

  describe('Enum', () => {
    it('Should build basic enum correctly', () => {
      const ast = parse(`enum MyEnum { A, B, C }`);
      const result = visit(ast, {
        leave: new FlowVisitor({ namingConvention: null })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export const MyEnumValues = Object.freeze({
          A: 'A',
          B: 'B',
          C: 'C'
        });

        export type MyEnum = $Values<typeof MyEnumValues>;
      `);

      validateFlow(result.definitions[0]);
    });

    it('Should build enum correctly with custom values', () => {
      const ast = parse(`enum MyEnum { A, B, C }`);
      const result = visit(ast, {
        leave: new FlowVisitor({
          namingConvention: null,
          scalars: SCALARS,
          enumValues: { A: 'SomeValue', B: 'TEST' }
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export const MyEnumValues = Object.freeze({
          A: 'SomeValue',
          B: 'TEST',
          C: 'C'
        });

        export type MyEnum = $Values<typeof MyEnumValues>;
      `);

      validateFlow(result.definitions[0]);
    });
  });

  describe('Scalar', () => {
    it('Should build basic scalar correctly as any', () => {
      const ast = parse(`scalar A`);
      const result = visit(ast, {
        leave: new FlowVisitor({ namingConvention: null })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type A = any;
      `);

      validateFlow(result.definitions[0]);
    });

    it('Should build enum correctly with custom values', () => {
      const ast = parse(`scalar A`);
      const result = visit(ast, {
        leave: new FlowVisitor({
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

      validateFlow(result.definitions[0]);
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
        leave: new FlowVisitor({
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

      validateFlow(result.definitions[0]);
      validateFlow(result.definitions[1]);
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
        leave: new FlowVisitor({
          namingConvention: null,
          scalars: { String: 'string' },
          enumValues: {}
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyType = {
          foo?: ?string,
          bar: string,
        };
      `);
      validateFlow(result.definitions[0]);
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
        leave: new FlowVisitor({
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
      validateFlow(result.definitions[0]);
      validateFlow(result.definitions[1]);
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
        leave: new FlowVisitor({
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
      validateFlow(result.definitions[0]);
      validateFlow(result.definitions[1]);
      validateFlow(result.definitions[2]);
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
        leave: new FlowVisitor({
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
      validateFlow(result.definitions[0]);
      validateFlow(result.definitions[1]);
    });
  });

  describe('Union', () => {
    it('Should build union as type correctly', () => {
      const ast = parse(`
      type MyType {
        foo: String!
      }

      type MyOtherType {
        bar: String!
      }
      
      union MyUnion = MyType | MyOtherType
      `);
      const result = visit(ast, {
        leave: new FlowVisitor({
          namingConvention: null,
          scalars: { String: 'string' },
          enumValues: {}
        })
      });

      expect(result.definitions[2]).toBeSimilarStringTo(`
      export type MyUnion = MyType | MyOtherType;
    `);
      validateFlow(result.definitions[0]);
      validateFlow(result.definitions[1]);
      validateFlow(result.definitions[2]);
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
        leave: new FlowVisitor({
          namingConvention: null,
          scalars: { String: 'string' },
          enumValues: {}
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyInterface = {
          foo?: ?string,
          bar: string,
        };
      `);
      validateFlow(result.definitions[0]);
    });
  });

  describe('Directives', () => {
    it('Should handle directive declarations correctly', () => {
      const ast = parse(`
        directive @simple on FIELD_DEFINITION
        directive @withArgument(arg: Int!) on FIELD_DEFINITION
        directive @objSimple on OBJECT
        directive @universal on OBJECT | FIELD_DEFINITION | ENUM_VALUE
      `);

      const result = visit(ast, {
        leave: new FlowVisitor({
          namingConvention: null
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo('');
      validateFlow(result.definitions[0]);
    });
  });

  describe('Output options', () => {
    it('Should respect flow option useFlowExactObjects', () => {
      const ast = parse(`
        interface MyInterface {
          foo: String
          bar: String!
        }`);
      const result = visit(ast, {
        leave: new FlowVisitor({
          useFlowExactObjects: true
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyInterface = {|
          foo?: ?string,
          bar: string,
        |};
      `);
      validateFlow(result.definitions[0]);
    });

    it('Should respect flow option useFlowReadOnlyTypes', () => {
      const ast = parse(`
        interface MyInterface {
          foo: String
          bar: String!
        }

        enum MyEnum {
          A
          B
          C
        }  
      `);
      const result = visit(ast, {
        leave: new FlowVisitor({
          useFlowReadOnlyTypes: true
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`
        export type MyInterface = {
          +foo?: ?string,
          +bar: string,
        };
      `);

      expect(result.definitions[1]).toBeSimilarStringTo(`
        export const MyEnumValues = Object.freeze({
          A: 'A',
          B: 'B',
          C: 'C'
        });

        export type MyEnum = $Values<typeof MyEnumValues>;
      `);

      validateFlow(result.definitions[0]);
      validateFlow(result.definitions[1]);
    });
  });
});
