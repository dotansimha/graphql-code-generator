import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';
import { schema } from '../../../typescript/resolvers/tests/common.js';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { ENUM_RESOLVERS_SIGNATURE } from '../src/visitor.js';

describe('Flow Resolvers Plugin', () => {
  describe('Enums', () => {
    it('Should not generate enum internal values resolvers when enum doesnt have enumValues set', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          v: MyEnum
        }

        enum MyEnum {
          A
          B
          C
        }
      `);
      const config = {};
      const result = await plugin(testSchema, [], config, { outputFile: '' });

      expect(result.prepend).not.toContain(ENUM_RESOLVERS_SIGNATURE);
      expect(result.content).not.toContain('EnumResolverSignature');
    });

    it('Should generate enum internal values resolvers when enum has enumValues set as object with explicit values', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          v: MyEnum
        }

        enum MyEnum {
          A
          B
          C
        }
      `);
      const config = {
        enumValues: {
          MyEnum: {
            A: 'val_1',
            B: 'val_2',
            C: 'val_3',
          },
        },
      };
      const result = await plugin(testSchema, [], config, { outputFile: '' });
      expect(result.prepend).not.toContain(ENUM_RESOLVERS_SIGNATURE);
      expect(result.content).not.toContain('EnumResolverSignature');
      expect(result.content).toContain(`export type MyEnumResolvers = {| A: 'val_1', B: 'val_2', C: 'val_3' |};`);
    });

    it('Should generate enum internal values resolvers when enum has enumValues set as external enum', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          v: MyEnum
        }

        enum MyEnum {
          A
          B
          C
        }
      `);
      const config = {
        enumValues: {
          MyEnum: 'MyCustomEnum',
        },
      };
      const result = await plugin(testSchema, [], config, { outputFile: '' });

      expect(result.prepend).toContain(ENUM_RESOLVERS_SIGNATURE);
      expect(result.content).toContain('EnumResolverSignature');
      expect(result.content).toContain(
        `export type MyEnumResolvers = EnumResolverSignature<{| A?: *, B?: *, C?: * |}, $ElementType<ResolversTypes, 'MyEnum'>>;`
      );
      expect(result.content).toContain(`MyEnum?: MyEnumResolvers,`);
    });

    it('Should generate enum internal values resolvers when enum has mappers pointing to external enum', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          v: MyEnum
        }

        enum MyEnum {
          A
          B
          C
        }
      `);
      const config = {
        mappers: {
          MyEnum: 'MyCustomEnum',
        },
      };
      const result = await plugin(testSchema, [], config, { outputFile: '' });

      expect(result.prepend).toContain(ENUM_RESOLVERS_SIGNATURE);
      expect(result.content).toContain('EnumResolverSignature');
      expect(result.content).toContain(
        `export type MyEnumResolvers = EnumResolverSignature<{| A?: *, B?: *, C?: * |}, $ElementType<ResolversTypes, 'MyEnum'>>;`
      );
    });

    it('Should generate enum internal values resolvers when enum has enumValues set on a global level of all enums', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          v: MyEnum
        }

        enum MyEnum {
          A
          B
          C
        }
      `);
      const config = {
        enumValues: './enums',
      };
      const result = await plugin(testSchema, [], config, { outputFile: '' });

      expect(result.prepend).toContain(ENUM_RESOLVERS_SIGNATURE);
      expect(result.content).toContain('EnumResolverSignature');
      expect(result.content).toContain(
        `export type MyEnumResolvers = EnumResolverSignature<{| A?: *, B?: *, C?: * |}, $ElementType<ResolversTypes, 'MyEnum'>>;`
      );
    });
  });

  it('Should generate basic type resolvers', () => {
    const result = plugin(schema, [], {}, { outputFile: '' });

    expect(result).toMatchSnapshot();
  });

  it('Default values of args and compatibility with flow plugin', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        something(arg: String = "default_value"): String
      }
    `);

    const config: any = { noSchemaStitching: true };
    const result = await plugin(testSchema, [], config, { outputFile: '' });

    expect(result.prepend).toContain(
      `export type $RequireFields<Origin, Keys> = $Diff<Origin, Keys> & $ObjMapi<Keys, <Key>(k: Key) => $NonMaybeType<$ElementType<Origin, Key>>>;`
    );
    expect(result.content).toContain(
      `something?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, ContextType, $RequireFields<QuerySomethingArgs, { arg: * }>>,`
    );
  });

  it('Should generate ResolversParentTypes', () => {
    const result = plugin(schema, [], {}, { outputFile: '' }) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      /** Mapping between all available schema types and the resolvers parents */
      export type ResolversParentTypes = {
        MyType: $Diff<MyType, { unionChild: *  }> & { unionChild: ?$ElementType<ResolversParentTypes, 'ChildUnion'> },
        String: $ElementType<Scalars, 'String'>,
        Child: Child,
        MyOtherType: MyOtherType,
        ChildUnion: $ElementType<ResolversParentTypes, 'Child'> | $ElementType<ResolversParentTypes, 'MyOtherType'>,
        Query: {},
        Subscription: {},
        Node: $ElementType<ResolversParentTypes, 'SomeNode'>,
        ID: $ElementType<Scalars, 'ID'>,
        SomeNode: SomeNode,
        MyUnion: $ElementType<ResolversParentTypes, 'MyType'> | $ElementType<ResolversParentTypes, 'MyOtherType'>,
        MyScalar: $ElementType<Scalars, 'MyScalar'>,
        Int: $ElementType<Scalars, 'Int'>,
        Boolean: $ElementType<Scalars, 'Boolean'>,
      };
    `);
  });

  it('Should generate the correct imports when schema has scalars', () => {
    const result = plugin(buildSchema(`scalar MyScalar`), [], {}, { outputFile: '' }) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(
      `import { type GraphQLResolveInfo, type GraphQLScalarType, type GraphQLScalarTypeConfig } from 'graphql';`
    );
  });

  it('Should generate the correct imports when schema has no scalars', () => {
    const result = plugin(
      buildSchema(`type MyType { f: String }`),
      [],
      {},
      { outputFile: '' }
    ) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { type GraphQLResolveInfo } from 'graphql';`);
  });

  it('Should generate valid output with args', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        release: String
      }
      type Mutation {
        random(byteLength: Int!): String!
      }
      schema {
        query: Query
        mutation: Mutation
      }
    `);
    const config = {
      contextType: 'GraphQLContext',
      skipTypename: true,
      addUnderscoreToArgsType: true,
    };
    const result = await plugin(testSchema, [], config, { outputFile: '' });
    const o = mergeOutputs([result]);
    expect(o).toContain(`$RequireFields<Mutation_RandomArgs, { byteLength: * }>>,`);
    expect(o).toContain(
      `export type $RequireFields<Origin, Keys> = $Diff<Origin, Keys> & $ObjMapi<Keys, <Key>(k: Key) => $NonMaybeType<$ElementType<Origin, Key>>>;`
    );
  });

  it('Should generate the correct resolver args type names when typesPrefix is specified', () => {
    const result = plugin(
      buildSchema(`type MyType { f(a: String): String }`),
      [],
      { typesPrefix: 'T' },
      { outputFile: '' }
    ) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(
      `f?: Resolver<?$ElementType<TResolversTypes, 'String'>, ParentType, ContextType, TMyTypeFArgs>,`
    );
  });

  it('should use MaybePromise in ResolverTypeWrapper', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type MyQuery {
        posts: [Post]
      }

      type Post {
        author: String
        comment: String
      }

      schema {
        query: MyQuery
      }
    `);
    const content = (await plugin(
      testSchema,
      [],
      {
        rootValueType: 'MyRoot',
        asyncResolverTypes: true,
      } as any,
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(content.content).toBeSimilarStringTo(`
      export type ResolverTypeWrapper<T> = Promise<T> | T;
    `);
  });
});
