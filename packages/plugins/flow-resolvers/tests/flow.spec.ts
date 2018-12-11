import 'graphql-codegen-core/dist/testing';
import { FlowResolversVisitor } from './../src/visitor';
import { parse, visit } from 'graphql';

describe('Flow Resolvers Plugin', () => {
  it('', () => {
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
      leave: new FlowResolversVisitor({})
    });

    //   expect(result.definitions[2]).toBeSimilarStringTo(`
    //   export type MyUnion = MyType | MyOtherType;
    // `);
  });
});
