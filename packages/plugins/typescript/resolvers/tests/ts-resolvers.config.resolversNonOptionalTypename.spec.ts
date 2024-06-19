import { resolversTestingSchema } from '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

describe('TypeScript Resolvers Plugin - config.resolversNonOptionalTypename', () => {
  it('excludes types', async () => {
    const result = await plugin(
      resolversTestingSchema,
      [],
      {
        resolversNonOptionalTypename: {
          unionMember: true,
          interfaceImplementingType: true,
          excludeTypes: ['ChildUnion', 'AnotherNode', 'Node'],
        },
      },
      { outputFile: '' }
    );

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( MyOtherType );
        MyUnion: ( Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> } & { __typename: 'MyType' } ) | ( MyOtherType & { __typename: 'MyOtherType' } );
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } & { __typename: 'AnotherNodeWithChild' } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
      };
    `);
  });

  it('adds non-optional typenames to implemented types', async () => {
    const result = await plugin(resolversTestingSchema, [], { resolversNonOptionalTypename: true }, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Child & { __typename: 'Child' } ) | ( MyOtherType & { __typename: 'MyOtherType' } );
        MyUnion: ( Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> } & { __typename: 'MyType' } ) | ( MyOtherType & { __typename: 'MyOtherType' } );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode & { __typename: 'SomeNode' } );
        AnotherNode: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } & { __typename: 'AnotherNodeWithChild' } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
        WithChild: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } & { __typename: 'AnotherNodeWithChild' } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
      };
    `);
  });

  it('adds non-optional typenames to ResolversUnionTypes', async () => {
    const result = await plugin(
      resolversTestingSchema,
      [],
      { resolversNonOptionalTypename: { unionMember: true } },
      { outputFile: '' }
    );

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Child & { __typename: 'Child' } ) | ( MyOtherType & { __typename: 'MyOtherType' } );
        MyUnion: ( Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> } & { __typename: 'MyType' } ) | ( MyOtherType & { __typename: 'MyOtherType' } );
      };
    `);
  });

  it('adds non-optional typenames to ResolversUnionTypes for mappers with no placeholder', async () => {
    const result = await plugin(
      resolversTestingSchema,
      [],
      {
        resolversNonOptionalTypename: { unionMember: true },
        mappers: { Child: 'ChildMapper', MyType: 'MyTypeMapper' },
      },
      { outputFile: '' }
    );

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( ChildMapper & { __typename: 'Child' } ) | ( MyOtherType & { __typename: 'MyOtherType' } );
        MyUnion: ( MyTypeMapper & { __typename: 'MyType' } ) | ( MyOtherType & { __typename: 'MyOtherType' } );
      };
    `);
  });

  it('adds non-optional typenames to ResolversUnionTypes for mappers with placeholder', async () => {
    const result = await plugin(
      resolversTestingSchema,
      [],
      {
        resolversNonOptionalTypename: { unionMember: true },
        mappers: { Child: 'Wrapper<{T}>', MyType: 'MyWrapper<{T}>' },
      },
      { outputFile: '' }
    );

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Wrapper<Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> }> & { __typename: 'Child' } ) | ( MyOtherType & { __typename: 'MyOtherType' } );
        MyUnion: ( MyWrapper<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> }> & { __typename: 'MyType' } ) | ( MyOtherType & { __typename: 'MyOtherType' } );
      };
    `);
  });

  it('adds non-optional typenames to ResolversUnionTypes for default mappers with placeholder', async () => {
    const result = await plugin(
      resolversTestingSchema,
      [],
      {
        resolversNonOptionalTypename: { unionMember: true },
        defaultMapper: 'Partial<{T}>',
      },
      { outputFile: '' }
    );

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Partial<Child> & { __typename: 'Child' } ) | ( Partial<MyOtherType> & { __typename: 'MyOtherType' } );
        MyUnion: ( Partial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> }> & { __typename: 'MyType' } ) | ( Partial<MyOtherType> & { __typename: 'MyOtherType' } );
      };
    `);
  });

  it('does not create ResolversUnionTypes for default mappers with no placeholder', async () => {
    const result = await plugin(
      resolversTestingSchema,
      [],
      {
        resolversNonOptionalTypename: { unionMember: true },
        defaultMapper: '{}',
      },
      { outputFile: '' }
    );

    expect(result.content).not.toBeSimilarStringTo('export type ResolversUnionTypes');
    expect(result.content).not.toBeSimilarStringTo('export type ResolversUnionParentTypes');
  });

  it('adds non-optional typenames to ResolversInterfaceTypes', async () => {
    const result = await plugin(
      resolversTestingSchema,
      [],
      { resolversNonOptionalTypename: { interfaceImplementingType: true } },
      { outputFile: '' }
    );

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode & { __typename: 'SomeNode' } );
        AnotherNode: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } & { __typename: 'AnotherNodeWithChild' } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
        WithChild: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } & { __typename: 'AnotherNodeWithChild' } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
      };
    `);
  });

  it('adds non-optional typenames to ResolversInterfaceTypes for mappers with no placeholder', async () => {
    const result = await plugin(
      resolversTestingSchema,
      [],
      {
        resolversNonOptionalTypename: { interfaceImplementingType: true },
        mappers: { AnotherNodeWithChild: 'AnotherNodeWithChildMapper' },
      },
      { outputFile: '' }
    );

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode & { __typename: 'SomeNode' } );
        AnotherNode: ( AnotherNodeWithChildMapper & { __typename: 'AnotherNodeWithChild' } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
        WithChild: ( AnotherNodeWithChildMapper & { __typename: 'AnotherNodeWithChild' } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
      };
    `);
  });

  it('adds non-optional typenames to ResolversInterfaceTypes for mappers with placeholder', async () => {
    const result = await plugin(
      resolversTestingSchema,
      [],
      {
        resolversNonOptionalTypename: { interfaceImplementingType: true },
        mappers: { AnotherNodeWithChild: 'Wrapper<{T}>' },
      },
      { outputFile: '' }
    );

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode & { __typename: 'SomeNode' } );
        AnotherNode: ( Wrapper<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> & { __typename: 'AnotherNodeWithChild' } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
        WithChild: ( Wrapper<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> & { __typename: 'AnotherNodeWithChild' } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } & { __typename: 'AnotherNodeWithAll' } );
      };
    `);
  });

  it('adds non-optional typenames to ResolversInterfaceTypes for default mappers with placeholder', async () => {
    const result = await plugin(
      resolversTestingSchema,
      [],
      {
        resolversNonOptionalTypename: { interfaceImplementingType: true },
        defaultMapper: 'Partial<{T}>',
      },
      { outputFile: '' }
    );

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( Partial<SomeNode> & { __typename: 'SomeNode' } );
        AnotherNode: ( Partial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> & { __typename: 'AnotherNodeWithChild' } ) | ( Partial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> & { __typename: 'AnotherNodeWithAll' } );
        WithChild: ( Partial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> & { __typename: 'AnotherNodeWithChild' } ) | ( Partial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> & { __typename: 'AnotherNodeWithAll' } );
        WithChildren: ( Partial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> & { __typename: 'AnotherNodeWithAll' } );
      };
    `);
  });

  it('does not create ResolversInterfaceTypes for default mappers with no placeholder', async () => {
    const result = await plugin(
      resolversTestingSchema,
      [],
      {
        resolversNonOptionalTypename: { interfaceImplementingType: true },
        defaultMapper: 'unknown',
      },
      { outputFile: '' }
    );

    expect(result.content).not.toBeSimilarStringTo('export type ResolversInterfaceTypes');
  });
});
