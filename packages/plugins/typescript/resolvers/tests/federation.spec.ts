import '@graphql-codegen/testing';
import { parse } from 'graphql';
import { codegen } from '@graphql-codegen/core';
import { plugin } from '../src';
import { TypeScriptResolversPluginConfig } from '../src/config';

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
  it('should add __resolveReference to objects that have @key', async () => {
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
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & RecursivePick<ParentType, {"id":true}>, ContextType>;
    `);
    // Foo shouldn't because it doesn't have @key
    expect(content).not.toBeSimilarStringTo(`
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Book']>, { __typename: 'Book' } & RecursivePick<ParentType, {"id":true}>, ContextType>;
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
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & RecursivePick<ParentType, {"id":true}>, ContextType>;
    `);
    // Foo shouldn't because it doesn't have @key
    expect(content).not.toBeSimilarStringTo(`
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Book']>, { __typename: 'Book' } & RecursivePick<ParentType, {"id":true}>, ContextType>;
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

    // User should have it
    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & RecursivePick<ParentType, {"id":true}>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], { __typename: 'User' } & RecursivePick<ParentType, {"id":true}>, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & RecursivePick<ParentType, {"id":true}> & RecursivePick<ParentType, {"name":true,"age":true}>, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
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
        street: String!
        zip: Int!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & RecursivePick<ParentType, {"id":true}>, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & RecursivePick<ParentType, {"id":true}> & RecursivePick<ParentType, {"name":true,"age":true,"address":{"street":true}}>, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);
  });

  it('should handle nested fields from @key directive', async () => {
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
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & RecursivePick<ParentType, {"name":{"first":true,"last":true}}>, ContextType>;
        name?: Resolver<ResolversTypes['Name'], { __typename: 'User' } & RecursivePick<ParentType, {"name":{"first":true,"last":true}}>, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & RecursivePick<ParentType, {"name":{"first":true,"last":true}}>, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
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
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & RecursivePick<ParentType, {"id":true}>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], { __typename: 'User' } & RecursivePick<ParentType, {"id":true}>, ContextType>;
        name?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & RecursivePick<ParentType, {"id":true}>, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
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

      type User @key(fields: "id") @key(fields: "name") {
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
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & (RecursivePick<ParentType, {"id":true}> | RecursivePick<ParentType, {"name":true}>), ContextType>;
        id?: Resolver<ResolversTypes['ID'], { __typename: 'User' } & (RecursivePick<ParentType, {"id":true}> | RecursivePick<ParentType, {"name":true}>), ContextType>;
        name?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & (RecursivePick<ParentType, {"id":true}> | RecursivePick<ParentType, {"name":true}>), ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & (RecursivePick<ParentType, {"id":true}> | RecursivePick<ParentType, {"name":true}>), ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
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

  describe('When field definition wrapping is enabled', () => {
    it('should add the UnwrappedObject type', async () => {
      const federatedSchema = /* GraphQL */ `
        type User @key(fields: "id") {
          id: ID!
        }
      `;

      const content = await generate({
        schema: federatedSchema,
        config: {
          federation: true,
          wrapFieldDefinitions: true,
        },
      });

      expect(content).toBeSimilarStringTo(`type UnwrappedObject<T> = {`);
    });

    it('should add UnwrappedObject around ParentType for __resloveReference', async () => {
      const federatedSchema = /* GraphQL */ `
        type User @key(fields: "id") {
          id: ID!
        }
      `;

      const content = await generate({
        schema: federatedSchema,
        config: {
          federation: true,
          wrapFieldDefinitions: true,
        },
      });

      // __resolveReference should be unwrapped
      expect(content).toBeSimilarStringTo(`
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & RecursivePick<UnwrappedObject<ParentType>, {"id":true}>, ContextType>;
      `);
      // but ID should not
      expect(content).toBeSimilarStringTo(`id?: Resolver<ResolversTypes['ID'], { __typename: 'User' } & RecursivePick<ParentType, {"id":true}>, ContextType>`);
    });
  });
});
