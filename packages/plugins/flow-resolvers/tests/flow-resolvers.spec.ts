import 'graphql-codegen-core/dist/testing';
import { FlowResolversVisitor } from '../src/visitor';
import { parse, visit } from 'graphql';
import { validateFlow } from './validate-flow';

describe('Flow Resolvers Plugin', () => {
  it('Should generate basic type resolvers', () => {
    const ast = parse(`
    type MyType {
      foo: String!
      otherType: MyOtherType
      withArgs(arg: String, arg2: String!): String
    }

    type MyOtherType {
      bar: String!
    }

    type Query {
      something: MyType!
    }

    type Subscription {
      somethingChanged: MyOtherType
    }
    
    union MyUnion = MyType | MyOtherType
    `);
    const result = visit(ast, {
      leave: new FlowResolversVisitor({}, 'Subscription')
    });

    const mergedResult = result.definitions.join('\n');

    expect(mergedResult).toBeSimilarStringTo(`
        export interface MyTypeResolvers<Context = any, ParentType = MyType> {
          foo?: Resolver<string, ParentType, Context>,
          otherType?: Resolver<?MyOtherType, ParentType, Context>,
          withArgs?: Resolver<?string, ParentType, Context, MyTypeWithArgsArgs>,
        };
    
        export interface MyOtherTypeResolvers<Context = any, ParentType = MyOtherType> {
          bar?: Resolver<string, ParentType, Context>,
        };
    
        export interface QueryResolvers<Context = any, ParentType = Query> {
          something?: Resolver<MyType, ParentType, Context>,
        };
    
        export interface SubscriptionResolvers<Context = any, ParentType = Subscription> {
          somethingChanged?: SubscriptionResolver<?MyOtherType, ParentType, Context>,
        };
    `);
  });
});
