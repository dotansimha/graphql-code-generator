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
        Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
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
        Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
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
        Child: ResolverTypeWrapper<Omit<I_Child_Types, 'parent'> & { parent?: Maybe<I_ResolversTypes_Types['MyType']> }>;
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
        Child: Omit<I_Child_Types, 'parent'> & { parent?: Maybe<I_ResolversParentTypes_Types['MyType']> };
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

  it('generates overridden interface types for interfaces wrapped in object types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      interface I_Node {
        id: ID!
      }

      interface I_WithChild {
        node: I_Node!
      }

      interface I_WithChildren {
        nodes: [I_Node!]!
      }

      type T_NodeWithChild implements I_Node & I_WithChild {
        id: ID!
        node: I_Node
      }

      type T_NodeWithChildren implements I_Node & I_WithChildren {
        id: ID!
        nodes: [I_Node!]!
      }

      type T_Level1 {
        boolean: Boolean!
        string: String!
        i_node: I_Node!
        i_withChild: I_WithChild!
        i_withChildren: I_WithChildren!
        t_nodeWithChild: T_NodeWithChild!
        t_nodeWithChildren: T_NodeWithChildren!
        t_self: T_Level1!
        t_level2A: T_Level2A!
        t_level2B: T_Level2B!
        t_nodeWithNoAbstractFieldLevel1: T_WithNoAbstractFieldLevel1!
      }

      type T_Level2A {
        t_level1: T_Level1!
        t_level1Array: [T_Level1!]!
      }

      type T_Level2B {
        t_level3: T_Level3
      }

      type T_Level3 {
        t_level4Array: [T_Level4!]!
      }

      type T_Level4 {
        node: I_Node!
      }

      type T_WithNoAbstractFieldLevel1 {
        id: ID!
        t_self: [T_WithNoAbstractFieldLevel1!]!
        t_withNoAbstractFieldLevel2: T_WithNoAbstractFieldLevel2!
      }

      type T_WithNoAbstractFieldLevel2 {
        id: ID!
        t_withNoAbstractFieldLevel3: T_WithNoAbstractFieldLevel3
      }

      type T_WithNoAbstractFieldLevel3 {
        id: ID!
      }

      type Query {
        level1: T_Level1!
      }
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        I_Node: ( Omit<T_NodeWithChild, 'node'> & { node?: Maybe<_RefType['I_Node']> } ) | ( Omit<T_NodeWithChildren, 'nodes'> & { nodes: Array<_RefType['I_Node']> } );
        I_WithChild: ( Omit<T_NodeWithChild, 'node'> & { node?: Maybe<_RefType['I_Node']> } );
        I_WithChildren: ( Omit<T_NodeWithChildren, 'nodes'> & { nodes: Array<_RefType['I_Node']> } );
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        I_Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['I_Node']>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        I_WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['I_WithChild']>;
        I_WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['I_WithChildren']>;
        T_NodeWithChild: ResolverTypeWrapper<Omit<T_NodeWithChild, 'node'> & { node?: Maybe<ResolversTypes['I_Node']> }>;
        T_NodeWithChildren: ResolverTypeWrapper<Omit<T_NodeWithChildren, 'nodes'> & { nodes: Array<ResolversTypes['I_Node']> }>;
        T_Level1: ResolverTypeWrapper<Omit<T_Level1, 'i_node' | 'i_withChild' | 'i_withChildren' | 't_nodeWithChild' | 't_nodeWithChildren' | 't_self' | 't_level2A' | 't_level2B'> & { i_node: ResolversTypes['I_Node'], i_withChild: ResolversTypes['I_WithChild'], i_withChildren: ResolversTypes['I_WithChildren'], t_nodeWithChild: ResolversTypes['T_NodeWithChild'], t_nodeWithChildren: ResolversTypes['T_NodeWithChildren'], t_self: ResolversTypes['T_Level1'], t_level2A: ResolversTypes['T_Level2A'], t_level2B: ResolversTypes['T_Level2B'] }>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        T_Level2A: ResolverTypeWrapper<Omit<T_Level2A, 't_level1' | 't_level1Array'> & { t_level1: ResolversTypes['T_Level1'], t_level1Array: Array<ResolversTypes['T_Level1']> }>;
        T_Level2B: ResolverTypeWrapper<Omit<T_Level2B, 't_level3'> & { t_level3?: Maybe<ResolversTypes['T_Level3']> }>;
        T_Level3: ResolverTypeWrapper<Omit<T_Level3, 't_level4Array'> & { t_level4Array: Array<ResolversTypes['T_Level4']> }>;
        T_Level4: ResolverTypeWrapper<Omit<T_Level4, 'node'> & { node: ResolversTypes['I_Node'] }>;
        T_WithNoAbstractFieldLevel1: ResolverTypeWrapper<T_WithNoAbstractFieldLevel1>;
        T_WithNoAbstractFieldLevel2: ResolverTypeWrapper<T_WithNoAbstractFieldLevel2>;
        T_WithNoAbstractFieldLevel3: ResolverTypeWrapper<T_WithNoAbstractFieldLevel3>;
        Query: ResolverTypeWrapper<{}>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        I_Node: ResolversInterfaceTypes<ResolversParentTypes>['I_Node'];
        ID: Scalars['ID']['output'];
        I_WithChild: ResolversInterfaceTypes<ResolversParentTypes>['I_WithChild'];
        I_WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['I_WithChildren'];
        T_NodeWithChild: Omit<T_NodeWithChild, 'node'> & { node?: Maybe<ResolversParentTypes['I_Node']> };
        T_NodeWithChildren: Omit<T_NodeWithChildren, 'nodes'> & { nodes: Array<ResolversParentTypes['I_Node']> };
        T_Level1: Omit<T_Level1, 'i_node' | 'i_withChild' | 'i_withChildren' | 't_nodeWithChild' | 't_nodeWithChildren' | 't_self' | 't_level2A' | 't_level2B'> & { i_node: ResolversParentTypes['I_Node'], i_withChild: ResolversParentTypes['I_WithChild'], i_withChildren: ResolversParentTypes['I_WithChildren'], t_nodeWithChild: ResolversParentTypes['T_NodeWithChild'], t_nodeWithChildren: ResolversParentTypes['T_NodeWithChildren'], t_self: ResolversParentTypes['T_Level1'], t_level2A: ResolversParentTypes['T_Level2A'], t_level2B: ResolversParentTypes['T_Level2B'] };
        Boolean: Scalars['Boolean']['output'];
        String: Scalars['String']['output'];
        T_Level2A: Omit<T_Level2A, 't_level1' | 't_level1Array'> & { t_level1: ResolversParentTypes['T_Level1'], t_level1Array: Array<ResolversParentTypes['T_Level1']> };
        T_Level2B: Omit<T_Level2B, 't_level3'> & { t_level3?: Maybe<ResolversParentTypes['T_Level3']> };
        T_Level3: Omit<T_Level3, 't_level4Array'> & { t_level4Array: Array<ResolversParentTypes['T_Level4']> };
        T_Level4: Omit<T_Level4, 'node'> & { node: ResolversParentTypes['I_Node'] };
        T_WithNoAbstractFieldLevel1: T_WithNoAbstractFieldLevel1;
        T_WithNoAbstractFieldLevel2: T_WithNoAbstractFieldLevel2;
        T_WithNoAbstractFieldLevel3: T_WithNoAbstractFieldLevel3;
        Query: {};
      };
    `);
  });

  it('correctly handles circular reference - variant 1', async () => {
    const schema = buildSchema(/* GraphQL */ `
      interface I_Node {
        id: ID!
      }

      type T_WithNode {
        node: I_Node!
      }

      type T_Type1 {
        id: ID!
        type2: T_Type2!
        withNode: T_WithNode! # abstract type is in T_Type1
      }

      type T_Type2 {
        id: ID!
        type1: T_Type1!
      }
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        I_Node: never;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        I_Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['I_Node']>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        T_WithNode: ResolverTypeWrapper<Omit<T_WithNode, 'node'> & { node: ResolversTypes['I_Node'] }>;
        T_Type1: ResolverTypeWrapper<Omit<T_Type1, 'type2' | 'withNode'> & { type2: ResolversTypes['T_Type2'], withNode: ResolversTypes['T_WithNode'] }>;
        T_Type2: ResolverTypeWrapper<Omit<T_Type2, 'type1'> & { type1: ResolversTypes['T_Type1'] }>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        I_Node: ResolversInterfaceTypes<ResolversParentTypes>['I_Node'];
        ID: Scalars['ID']['output'];
        T_WithNode: Omit<T_WithNode, 'node'> & { node: ResolversParentTypes['I_Node'] };
        T_Type1: Omit<T_Type1, 'type2' | 'withNode'> & { type2: ResolversParentTypes['T_Type2'], withNode: ResolversParentTypes['T_WithNode'] };
        T_Type2: Omit<T_Type2, 'type1'> & { type1: ResolversParentTypes['T_Type1'] };
        Boolean: Scalars['Boolean']['output'];
        String: Scalars['String']['output'];
      };
    `);
  });

  it('correctly handles circular reference - variant 2', async () => {
    const schema = buildSchema(/* GraphQL */ `
      interface I_Node {
        id: ID!
      }

      type T_WithNode {
        node: I_Node!
      }

      type T_Type1 {
        id: ID!
        type2: T_Type2!
      }

      type T_Type2 {
        id: ID!
        type1: T_Type1!
        withNode: T_WithNode! # abstract type is in T_Type2
      }
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        I_Node: never;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        I_Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['I_Node']>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        T_WithNode: ResolverTypeWrapper<Omit<T_WithNode, 'node'> & { node: ResolversTypes['I_Node'] }>;
        T_Type1: ResolverTypeWrapper<Omit<T_Type1, 'type2'> & { type2: ResolversTypes['T_Type2'] }>;
        T_Type2: ResolverTypeWrapper<Omit<T_Type2, 'type1' | 'withNode'> & { type1: ResolversTypes['T_Type1'], withNode: ResolversTypes['T_WithNode'] }>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        I_Node: ResolversInterfaceTypes<ResolversParentTypes>['I_Node'];
        ID: Scalars['ID']['output'];
        T_WithNode: Omit<T_WithNode, 'node'> & { node: ResolversParentTypes['I_Node'] };
        T_Type1: Omit<T_Type1, 'type2'> & { type2: ResolversParentTypes['T_Type2'] };
        T_Type2: Omit<T_Type2, 'type1' | 'withNode'> & { type1: ResolversParentTypes['T_Type1'], withNode: ResolversParentTypes['T_WithNode'] };
        Boolean: Scalars['Boolean']['output'];
        String: Scalars['String']['output'];
      };
    `);
  });

  it('does not generate nested types when avoidCheckingAbstractTypesRecursively=true', async () => {
    const schema = buildSchema(/* GraphQL */ `
      interface I_Node {
        id: ID!
      }

      type T_WithNode {
        node: I_Node!
      }

      type T_Type1 {
        id: ID!
        type2: T_Type2!
        withNode: T_WithNode! # abstract type is in T_Type1
      }

      type T_Type2 {
        id: ID!
        type1: T_Type1!
      }
    `);

    const result = await plugin(schema, [], { avoidCheckingAbstractTypesRecursively: true }, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        I_Node: never;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        I_Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['I_Node']>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        T_WithNode: ResolverTypeWrapper<Omit<T_WithNode, 'node'> & { node: ResolversTypes['I_Node'] }>;
        T_Type1: ResolverTypeWrapper<T_Type1>;
        T_Type2: ResolverTypeWrapper<T_Type2>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        I_Node: ResolversInterfaceTypes<ResolversParentTypes>['I_Node'];
        ID: Scalars['ID']['output'];
        T_WithNode: Omit<T_WithNode, 'node'> & { node: ResolversParentTypes['I_Node'] };
        T_Type1: T_Type1;
        T_Type2: T_Type2;
        Boolean: Scalars['Boolean']['output'];
        String: Scalars['String']['output'];
      };
    `);
  });
});
