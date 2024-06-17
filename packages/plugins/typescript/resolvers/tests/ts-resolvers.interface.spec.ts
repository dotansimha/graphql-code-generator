import { resolversTestingSchema } from '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript Resolvers Plugin - Interfaces', () => {
  it('should generate ResolversInterfaceTypes', async () => {
    const content = await plugin(resolversTestingSchema, [], {}, { outputFile: 'graphql.ts' });

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
      };
    `);

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        Child: ResolverTypeWrapper<Child>;
        MyOtherType: ResolverTypeWrapper<MyOtherType>;
        ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
        Query: ResolverTypeWrapper<{}>;
        Subscription: ResolverTypeWrapper<{}>;
        Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        SomeNode: ResolverTypeWrapper<SomeNode>;
        AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
        WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
        WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
        AnotherNodeWithChild: ResolverTypeWrapper<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']> }>;
        AnotherNodeWithAll: ResolverTypeWrapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>;
        MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
        Int: ResolverTypeWrapper<Scalars['Int']['output']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };
    `);

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']> };
        String: Scalars['String']['output'];
        Child: Child;
        MyOtherType: MyOtherType;
        ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
        Query: {};
        Subscription: {};
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: SomeNode;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']> };
        AnotherNodeWithAll: Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> };
        MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
  });

  it('should generate ResolversInterfaceTypes with transformed type names correctly', async () => {
    const content = await plugin(
      resolversTestingSchema,
      [],
      { typesPrefix: 'I_', typesSuffix: '_Types' },
      { outputFile: 'graphql.ts' }
    );

    expect(content.content).toBeSimilarStringTo(`
      export type I_ResolversInterfaceTypes_Types<_RefType extends Record<string, unknown>> = {
        Node: ( I_SomeNode_Types );
        AnotherNode: ( Omit<I_AnotherNodeWithChild_Types, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<I_AnotherNodeWithAll_Types, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( Omit<I_AnotherNodeWithChild_Types, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<I_AnotherNodeWithAll_Types, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChildren: ( Omit<I_AnotherNodeWithAll_Types, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
      };
    `);

    expect(content.content).toBeSimilarStringTo(`
      export type I_ResolversTypes_Types = {
        MyType: ResolverTypeWrapper<Omit<I_MyType_Types, 'unionChild'> & { unionChild?: Maybe<I_ResolversTypes_Types['ChildUnion']> }>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        Child: ResolverTypeWrapper<I_Child_Types>;
        MyOtherType: ResolverTypeWrapper<I_MyOtherType_Types>;
        ChildUnion: ResolverTypeWrapper<I_ResolversUnionTypes_Types<I_ResolversTypes_Types>['ChildUnion']>;
        Query: ResolverTypeWrapper<{}>;
        Subscription: ResolverTypeWrapper<{}>;
        Node: ResolverTypeWrapper<I_ResolversInterfaceTypes_Types<I_ResolversTypes_Types>['Node']>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        SomeNode: ResolverTypeWrapper<I_SomeNode_Types>;
        AnotherNode: ResolverTypeWrapper<I_ResolversInterfaceTypes_Types<I_ResolversTypes_Types>['AnotherNode']>;
        WithChild: ResolverTypeWrapper<I_ResolversInterfaceTypes_Types<I_ResolversTypes_Types>['WithChild']>;
        WithChildren: ResolverTypeWrapper<I_ResolversInterfaceTypes_Types<I_ResolversTypes_Types>['WithChildren']>;
        AnotherNodeWithChild: ResolverTypeWrapper<Omit<I_AnotherNodeWithChild_Types, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<I_ResolversTypes_Types['ChildUnion']>, interfaceChild?: Maybe<I_ResolversTypes_Types['Node']> }>;
        AnotherNodeWithAll: ResolverTypeWrapper<Omit<I_AnotherNodeWithAll_Types, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<I_ResolversTypes_Types['ChildUnion']>, unionChildren: Array<I_ResolversTypes_Types['ChildUnion']>, interfaceChild?: Maybe<I_ResolversTypes_Types['Node']>, interfaceChildren: Array<I_ResolversTypes_Types['Node']> }>;
        MyUnion: ResolverTypeWrapper<I_ResolversUnionTypes_Types<I_ResolversTypes_Types>['MyUnion']>;
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
        Int: ResolverTypeWrapper<Scalars['Int']['output']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };
    `);

    expect(content.content).toBeSimilarStringTo(`
      export type I_ResolversParentTypes_Types = {
        MyType: Omit<I_MyType_Types, 'unionChild'> & { unionChild?: Maybe<I_ResolversParentTypes_Types['ChildUnion']> };
        String: Scalars['String']['output'];
        Child: I_Child_Types;
        MyOtherType: I_MyOtherType_Types;
        ChildUnion: I_ResolversUnionTypes_Types<I_ResolversParentTypes_Types>['ChildUnion'];
        Query: {};
        Subscription: {};
        Node: I_ResolversInterfaceTypes_Types<I_ResolversParentTypes_Types>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: I_SomeNode_Types;
        AnotherNode: I_ResolversInterfaceTypes_Types<I_ResolversParentTypes_Types>['AnotherNode'];
        WithChild: I_ResolversInterfaceTypes_Types<I_ResolversParentTypes_Types>['WithChild'];
        WithChildren: I_ResolversInterfaceTypes_Types<I_ResolversParentTypes_Types>['WithChildren'];
        AnotherNodeWithChild: Omit<I_AnotherNodeWithChild_Types, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<I_ResolversParentTypes_Types['ChildUnion']>, interfaceChild?: Maybe<I_ResolversParentTypes_Types['Node']> };
        AnotherNodeWithAll: Omit<I_AnotherNodeWithAll_Types, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<I_ResolversParentTypes_Types['ChildUnion']>, unionChildren: Array<I_ResolversParentTypes_Types['ChildUnion']>, interfaceChild?: Maybe<I_ResolversParentTypes_Types['Node']>, interfaceChildren: Array<I_ResolversParentTypes_Types['Node']> };
        MyUnion: I_ResolversUnionTypes_Types<I_ResolversParentTypes_Types>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
  });

  it('should NOT generate ResolversInterfaceTypes if there is no Interface', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        fullName: String!
      }
    `);
    const content = await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' });

    expect(content.content).not.toBeSimilarStringTo(`export type ResolversInterfaceTypes`);
  });

  it('Should generate valid types even when there are no implementers for an interface', async () => {
    const schemaWithNoImplementors = buildSchema(/* GraphQL */ `
      interface Node {
        id: ID!
      }

      type Query {
        node: Node!
      }
    `);

    const result = await plugin(schemaWithNoImplementors, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<null, ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);
  });
});
