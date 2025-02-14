import '@graphql-codegen/testing';
import { codegen } from '@graphql-codegen/core';
import { buildSchema, parse } from 'graphql';
import { TypeScriptResolversPluginConfig } from '../src/config.js';
import { plugin } from '../src/index.js';

function generate({ schema, config }: { schema: string; config: TypeScriptResolversPluginConfig }) {
  return codegen({
    filename: 'graphql.ts',
    schema: parse(schema),
    documents: [],
    plugins: [
      {
        'typescript-resolvers': {},
      },
    ],
    config,
    pluginMap: {
      'typescript-resolvers': {
        plugin,
      },
    },
  });
}

describe('TypeScript Resolvers Plugin + Apollo Federation', () => {
  it('generates __resolveReference for object types with resolvable @key', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        allUsers: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }

      type Book {
        id: ID!
      }

      type SingleResolvable @key(fields: "id", resolvable: true) {
        id: ID!
      }

      type SingleNonResolvable @key(fields: "id", resolvable: false) {
        id: ID!
      }

      type AtLeastOneResolvable
        @key(fields: "id", resolvable: false)
        @key(fields: "id2", resolvable: true)
        @key(fields: "id3", resolvable: false) {
        id: ID!
        id2: ID!
        id3: ID!
      }

      type MixedResolvable
        @key(fields: "id")
        @key(fields: "id2", resolvable: true)
        @key(fields: "id3", resolvable: false) {
        id: ID!
        id2: ID!
        id3: ID!
      }

      type MultipleNonResolvable
        @key(fields: "id", resolvable: false)
        @key(fields: "id2", resolvable: false)
        @key(fields: "id3", resolvable: false) {
        id: ID!
        id2: ID!
        id3: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).toBeSimilarStringTo(`
      export type FederationTypes = {
        User: User;
        SingleResolvable: SingleResolvable;
        AtLeastOneResolvable: AtLeastOneResolvable;
        MixedResolvable: MixedResolvable;
      };
    `);

    expect(content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        Query: {};
        User: User | ( { __typename: 'User' } & GraphQLRecursivePick<FederationTypes['User'], {"id":true}> );
        ID: Scalars['ID']['output'];
        String: Scalars['String']['output'];
        Book: Book;
        SingleResolvable: SingleResolvable | ( { __typename: 'SingleResolvable' } & GraphQLRecursivePick<FederationTypes['SingleResolvable'], {"id":true}> );
        SingleNonResolvable: SingleNonResolvable;
        AtLeastOneResolvable: AtLeastOneResolvable | ( { __typename: 'AtLeastOneResolvable' } & GraphQLRecursivePick<FederationTypes['AtLeastOneResolvable'], {"id2":true}> );
        MixedResolvable: MixedResolvable | ( { __typename: 'MixedResolvable' } & ( GraphQLRecursivePick<FederationTypes['MixedResolvable'], {"id":true}> | GraphQLRecursivePick<FederationTypes['MixedResolvable'], {"id2":true}> ) );
        MultipleNonResolvable: MultipleNonResolvable;
        Boolean: Scalars['Boolean']['output'];
      };
    `);

    // User should have __resolveReference because it has resolvable @key (by default)
    expect(content).toBeSimilarStringTo(`
    export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationType extends FederationTypes['User'] = FederationTypes['User']> = {
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
      id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
      username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    };
  `);

    // SingleResolvable has __resolveReference because it has resolvable: true
    expect(content).toBeSimilarStringTo(`
    export type SingleResolvableResolvers<ContextType = any, ParentType extends ResolversParentTypes['SingleResolvable'] = ResolversParentTypes['SingleResolvable'], FederationType extends FederationTypes['SingleResolvable'] = FederationTypes['SingleResolvable']> = {
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['SingleResolvable']>, { __typename: 'SingleResolvable' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
      id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    };
  `);

    // SingleNonResolvable does NOT have __resolveReference because it has resolvable: false
    expect(content).toBeSimilarStringTo(`
    export type SingleNonResolvableResolvers<ContextType = any, ParentType extends ResolversParentTypes['SingleNonResolvable'] = ResolversParentTypes['SingleNonResolvable']> = {
      id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    };
  `);

    // AtLeastOneResolvable has __resolveReference because it at least one resolvable
    expect(content).toBeSimilarStringTo(`
    export type AtLeastOneResolvableResolvers<ContextType = any, ParentType extends ResolversParentTypes['AtLeastOneResolvable'] = ResolversParentTypes['AtLeastOneResolvable'], FederationType extends FederationTypes['AtLeastOneResolvable'] = FederationTypes['AtLeastOneResolvable']> = {
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['AtLeastOneResolvable']>, { __typename: 'AtLeastOneResolvable' } & GraphQLRecursivePick<FederationType, {"id2":true}>, ContextType>;
      id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      id2?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      id3?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    };
  `);

    // MixedResolvable has __resolveReference and references for resolvable keys
    expect(content).toBeSimilarStringTo(`
    export type MixedResolvableResolvers<ContextType = any, ParentType extends ResolversParentTypes['MixedResolvable'] = ResolversParentTypes['MixedResolvable'], FederationType extends FederationTypes['MixedResolvable'] = FederationTypes['MixedResolvable']> = {
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['MixedResolvable']>, { __typename: 'MixedResolvable' } & (GraphQLRecursivePick<FederationType, {"id":true}> | GraphQLRecursivePick<FederationType, {"id2":true}>), ContextType>;
      id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      id2?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      id3?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    };
  `);

    // MultipleNonResolvableResolvers does NOT have __resolveReference because all keys are non-resolvable
    expect(content).toBeSimilarStringTo(`
    export type MultipleNonResolvableResolvers<ContextType = any, ParentType extends ResolversParentTypes['MultipleNonResolvable'] = ResolversParentTypes['MultipleNonResolvable']> = {
      id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      id2?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      id3?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    };
  `);

    // Book does NOT have __resolveReference because it doesn't have @key
    expect(content).toBeSimilarStringTo(`
    export type BookResolvers<ContextType = any, ParentType extends ResolversParentTypes['Book'] = ResolversParentTypes['Book']> = {
      id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    };
  `);
  });

  it('should support extend keyword', async () => {
    const federatedSchema = /* GraphQL */ `
      extend type Query {
        allUsers: [User]
      }

      extend type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }

      type Book {
        id: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
    `);
    // Foo shouldn't because it doesn't have @key
    expect(content).not.toBeSimilarStringTo(`
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Book']>, { __typename: 'Book' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
    `);
  });

  it('should include nested fields from @provides directive', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type Book {
        author: User @provides(fields: "name { first last}")
      }

      type Name @key(fields: "id") {
        id: ID! @external
        first: String!
        middle: String @external
        last: String!
      }

      type User @key(fields: "id") {
        id: ID!
        name: Name @external
        username: String @external
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationType extends FederationTypes['User'] = FederationTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
        name?: Resolver<Maybe<ResolversTypes['Name']>, { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
      }
    `);

    expect(content).toBeSimilarStringTo(`
      export type NameResolvers<ContextType = any, ParentType extends ResolversParentTypes['Name'] = ResolversParentTypes['Name'], FederationType extends FederationTypes['Name'] = FederationTypes['Name']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Name']>, { __typename: 'Name' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
        first?: Resolver<ResolversTypes['String'], { __typename: 'Name' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
        last?: Resolver<ResolversTypes['String'], { __typename: 'Name' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
      }
    `);
  });

  it('should include fields from @requires directive', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String @external
        age: Int! @external
        username: String @requires(fields: "name age")
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        Query: {};
        User: User | ( { __typename: 'User' } & GraphQLRecursivePick<FederationTypes['User'], {"id":true}> & GraphQLRecursivePick<FederationTypes['User'], {"name":true,"age":true}> );
        ID: Scalars['ID']['output'];
        String: Scalars['String']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);

    // User should have it
    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationType extends FederationTypes['User'] = FederationTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], Parent, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, Parent, ContextType>;
      };
    `);
  });

  it('should handle nested fields from @requires directive', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      extend type User @key(fields: "id") {
        id: ID! @external
        name: String @external
        age: Int! @external
        address: Address! @external
        username: String @requires(fields: "name age address { street }")
      }

      extend type Address {
        street: String! @external
        zip: Int! @external
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        Query: {};
        User: User | ( { __typename: 'User' } & GraphQLRecursivePick<FederationTypes['User'], {"id":true}> & GraphQLRecursivePick<FederationTypes['User'], {"name":true,"age":true,"address":{"street":true}}> );
        ID: Scalars['ID']['output'];
        String: Scalars['String']['output'];
        Int: Scalars['Int']['output'];
        Address: Address;
        Boolean: Scalars['Boolean']['output'];
      };
    `);

    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationType extends FederationTypes['User'] = FederationTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, Parent, ContextType>;
      };
    `);
  });

  it('should handle nested fields from @key directive', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "name { first last }") {
        name: Name! @external
        username: String
      }

      type Name {
        first: String! @external
        last: String! @external
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        Query: {};
        User: User | ( { __typename: 'User' } & GraphQLRecursivePick<FederationTypes['User'], {"name":{"first":true,"last":true}}> );
        String: Scalars['String']['output'];
        Name: Name;
        Boolean: Scalars['Boolean']['output'];
      };
    `);

    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationType extends FederationTypes['User'] = FederationTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"name":{"first":true,"last":true}}>, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, Parent, ContextType>;
      };
    `);
  });

  it('handles a mix of @key and @requires directives', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "id") @key(fields: "uuid") @key(fields: "legacyId { oldId1 oldId2 }") {
        id: ID!
        uuid: ID!
        legacyId: LegacyId! @external
        name: String! @external
        username: String! @requires(fields: "id name")
        usernameLegacy: String! @requires(fields: "legacyId { oldId1 } name")
      }

      type LegacyId {
        oldId1: ID! @external
        oldId2: ID! @external
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        Query: {};
        User: User | ( { __typename: 'User' } & ( GraphQLRecursivePick<FederationTypes['User'], {"id":true}> | GraphQLRecursivePick<FederationTypes['User'], {"uuid":true}> | GraphQLRecursivePick<FederationTypes['User'], {"legacyId":{"oldId1":true,"oldId2":true}}> ) & GraphQLRecursivePick<FederationTypes['User'], {"id":true,"name":true}> & GraphQLRecursivePick<FederationTypes['User'], {"legacyId":{"oldId1":true},"name":true}> );
        ID: Scalars['ID']['output'];
        String: Scalars['String']['output'];
        LegacyId: LegacyId;
        Boolean: Scalars['Boolean']['output'];
      };
    `);

    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationType extends FederationTypes['User'] = FederationTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & (GraphQLRecursivePick<FederationType, {"id":true}> | GraphQLRecursivePick<FederationType, {"uuid":true}> | GraphQLRecursivePick<FederationType, {"legacyId":{"oldId1":true,"oldId2":true}}>), ContextType>;
        id?: Resolver<ResolversTypes['ID'], Parent, ContextType>;
        uuid?: Resolver<ResolversTypes['ID'], Parent, ContextType>;
        username?: Resolver<ResolversTypes['String'], Parent, ContextType>;
        usernameLegacy?: Resolver<ResolversTypes['String'], Parent, ContextType>;
      };
    `);
  });

  it('should not apply key/requires fields restriction for base federated types', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "name { first last }") {
        name: Name!
        username: String
      }

      type Name {
        first: String!
        last: String!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationType extends FederationTypes['User'] = FederationTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"name":{"first":true,"last":true}}>, ContextType>;
        name?: Resolver<ResolversTypes['Name'], ParentType, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
      };
    `);
  });

  it('should skip to generate resolvers of fields with @external directive', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type Book {
        author: User @provides(fields: "name")
      }

      type User @key(fields: "id") {
        id: ID!
        name: String @external
        username: String @external
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // UserResolver should not have a resolver function of name field
    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationType extends FederationTypes['User'] = FederationTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
        name?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
      };
    `);
  });

  it('should not include _FieldSet scalar', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }

      type Book {
        id: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).not.toMatch(`_FieldSet`);
  });

  it('should not include federation directives', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }

      type Book {
        id: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).not.toMatch('ExternalDirectiveResolver');
    expect(content).not.toMatch('RequiresDirectiveResolver');
    expect(content).not.toMatch('ProvidesDirectiveResolver');
    expect(content).not.toMatch('KeyDirectiveResolver');
  });

  it('should not add directive definitions and scalars if they are already there', async () => {
    const federatedSchema = /* GraphQL */ `
      scalar _FieldSet

      directive @key(fields: _FieldSet!) on OBJECT | INTERFACE

      type Query {
        allUsers: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }

      type Book {
        id: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).not.toMatch(`_FieldSet`);
    expect(content).not.toMatch('ExternalDirectiveResolver');
    expect(content).not.toMatch('RequiresDirectiveResolver');
    expect(content).not.toMatch('ProvidesDirectiveResolver');
    expect(content).not.toMatch('KeyDirectiveResolver');
  });

  it('should allow for duplicated directives', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        allUsers: [User]
      }

      extend type User @key(fields: "id") @key(fields: "name") {
        id: ID! @external
        name: String
        username: String
      }

      type Book {
        id: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationType extends FederationTypes['User'] = FederationTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & (GraphQLRecursivePick<FederationType, {"id":true}> | GraphQLRecursivePick<FederationType, {"name":true}>), ContextType>;
        name?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & (GraphQLRecursivePick<FederationType, {"id":true}> | GraphQLRecursivePick<FederationType, {"name":true}>), ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & (GraphQLRecursivePick<FederationType, {"id":true}> | GraphQLRecursivePick<FederationType, {"name":true}>), ContextType>;
      };
    `);
  });

  it.skip('should only extend an original type by a mapped type', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
        age: Int!
        username: String
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
        mappers: {
          User: 'UserExtension',
        },
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & Pick<ParentType, 'id'>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], UserExtension & ParentType, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, UserExtension & ParentType & Pick<ParentType, 'name', 'age'>, ContextType>;
      };
    `);
  });

  it('should not generate unused scalars', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        user(id: ID!): User!
      }

      type User {
        id: ID!
        username: String!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // no GraphQLScalarTypeConfig
    expect(content).not.toContain('GraphQLScalarTypeConfig');
    // no GraphQLScalarType
    expect(content).not.toContain('GraphQLScalarType');
  });

  describe('meta', () => {
    it('generates federation meta correctly', async () => {
      const federatedSchema = /* GraphQL */ `
        scalar _FieldSet
        directive @key(fields: _FieldSet!, resolvable: Boolean) repeatable on OBJECT | INTERFACE

        type Query {
          user: UserPayload!
          allUsers: [User]
        }

        type User @key(fields: "id") {
          id: ID!
          name: String
          username: String
        }

        interface Node {
          id: ID!
        }

        type UserOk {
          id: ID!
        }
        type UserError {
          message: String!
        }
        union UserPayload = UserOk | UserError

        enum Country {
          FR
          US
        }

        type NotResolvable @key(fields: "id", resolvable: false) {
          id: ID!
        }

        type Resolvable @key(fields: "id", resolvable: true) {
          id: ID!
        }

        type MultipleResolvable
          @key(fields: "id")
          @key(fields: "id2", resolvable: true)
          @key(fields: "id3", resolvable: false) {
          id: ID!
          id2: ID!
          id3: ID!
        }

        type MultipleNonResolvable
          @key(fields: "id", resolvable: false)
          @key(fields: "id2", resolvable: false)
          @key(fields: "id3", resolvable: false) {
          id: ID!
          id2: ID!
          id3: ID!
        }
      `;

      const result = await plugin(buildSchema(federatedSchema), [], { federation: true }, { outputFile: '' });

      expect(result.meta?.generatedResolverTypes).toMatchInlineSnapshot(`
        Object {
          "resolversMap": Object {
            "name": "Resolvers",
          },
          "userDefined": Object {
            "MultipleNonResolvable": Object {
              "name": "MultipleNonResolvableResolvers",
            },
            "MultipleResolvable": Object {
              "federation": Object {
                "hasResolveReference": true,
              },
              "name": "MultipleResolvableResolvers",
            },
            "Node": Object {
              "name": "NodeResolvers",
            },
            "NotResolvable": Object {
              "name": "NotResolvableResolvers",
            },
            "Query": Object {
              "name": "QueryResolvers",
            },
            "Resolvable": Object {
              "federation": Object {
                "hasResolveReference": true,
              },
              "name": "ResolvableResolvers",
            },
            "User": Object {
              "federation": Object {
                "hasResolveReference": true,
              },
              "name": "UserResolvers",
            },
            "UserError": Object {
              "name": "UserErrorResolvers",
            },
            "UserOk": Object {
              "name": "UserOkResolvers",
            },
            "UserPayload": Object {
              "name": "UserPayloadResolvers",
            },
          },
        }
      `);
    });
  });
});
