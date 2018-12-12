import 'graphql-codegen-core/dist/testing';
import { FlowResolversVisitor } from '../src/visitor';
import { parse, visit, printSchema } from 'graphql';
import { validateFlow } from './validate-flow';
import { makeExecutableSchema } from 'graphql-tools';
import { plugin } from '../src';

describe('Flow Resolvers Plugin', () => {
  it('Should generate basic type resolvers', () => {
    const schema = makeExecutableSchema({
      typeDefs: `
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
    
    interface Node {
      id: ID!
    }

    type SomeNode implements Node {
      id: ID!
    }
    `
    });
    const result = plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export interface MyOtherTypeResolvers<Context = any, ParentType = MyOtherType> {
      bar?: Resolver<string, ParentType, Context>,
    };

    export interface MyTypeResolvers<Context = any, ParentType = MyType> {
      foo?: Resolver<string, ParentType, Context>,
      otherType?: Resolver<?MyOtherType, ParentType, Context>,
      withArgs?: Resolver<?string, ParentType, Context, MyTypeWithArgsArgs>,
    };

    export interface NodeResolvers<Context = any, ParentType = Node> {
      __resolveType: TypeResolveFn<'SomeNode'>
    };

    export interface QueryResolvers<Context = any, ParentType = Query> {
      something?: Resolver<MyType, ParentType, Context>,
    };

    export interface SomeNodeResolvers<Context = any, ParentType = SomeNode> {
      id?: Resolver<string, ParentType, Context>,
    };

    export interface SubscriptionResolvers<Context = any, ParentType = Subscription> {
      somethingChanged?: SubscriptionResolver<?MyOtherType, ParentType, Context>,
    };
    `);
  });
});
