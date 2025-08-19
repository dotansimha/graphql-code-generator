import { BaseResolversVisitor, ParsedResolversConfig } from '@graphql-codegen/visitor-plugin-common';
import { buildSchema } from 'graphql';

describe('BaseResolversVisitor.createResolversFields', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Query {
      a: A
    }

    type A {
      b: B
    }

    enum B {
      C
    }
  `);

  it('checks if types are actually included when Omit is applied', () => {
    /**
     * This makes sure that https://github.com/dotansimha/graphql-code-generator/issues/6709 doesn't occur again.
     * The result looked like this without the fix:
     * export type ResolversParentTypes = {
     *   Query: {}
     *   A: Omit<A, 'b'> & { b?: Maybe<ResolversParentTypes['B']> }
     *   Boolean: Scalars['Boolean']['output']
     *   String: Scalars['String']['output']
     * };
     */
    const visitor = new BaseResolversVisitor(
      {
        mappers: {
          B: './some-file#B',
        },
      },
      {} as ParsedResolversConfig,
      schema
    );

    expect(visitor.buildResolversParentTypes()).toEqual(
      `/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: Record<PropertyKey, never>
  A: A
  Boolean: Scalars['Boolean']['output']
  String: Scalars['String']['output']
};
`
    );
  });

  it('generates proper types when typesPrefix is used along with `enumPrefix: false`', () => {
    /**
     * This makes sure that https://github.com/dotansimha/graphql-code-generator/issues/6709 doesn't occur again.
     * The result looked like this without the fix:
     * export type ResolversParentTypes = {
     *   Query: {}
     *   A: Omit<A, 'b'> & { b?: Maybe<ResolversParentTypes['B']> }
     *   Boolean: Scalars['Boolean']['output']
     *   String: Scalars['String']['output']
     * };
     */
    const visitor = new BaseResolversVisitor(
      {
        mappers: {
          B: './some-file#B',
        },
        typesPrefix: 'I',
        enumPrefix: false,
      },
      {} as ParsedResolversConfig,
      schema
    );

    expect(visitor.buildResolversParentTypes()).toEqual(
      `/** Mapping between all available schema types and the resolvers parents */
export type IResolversParentTypes = {
  Query: Record<PropertyKey, never>
  A: IA
  Boolean: Scalars['Boolean']['output']
  String: Scalars['String']['output']
};
`
    );
  });

  it('generates proper types when typesSuffix is used along with `enumSuffix: false`', () => {
    const visitor = new BaseResolversVisitor(
      {
        mappers: {
          B: './some-file#B',
        },
        typesSuffix: 'I',
        enumSuffix: false,
      },
      {} as ParsedResolversConfig,
      schema
    );

    expect(visitor.buildResolversParentTypes()).toEqual(
      `/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypesI = {
  Query: Record<PropertyKey, never>
  A: AI
  Boolean: Scalars['Boolean']['output']
  String: Scalars['String']['output']
};
`
    );
  });
});
