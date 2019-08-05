import '@graphql-codegen/testing';
import { parse } from 'graphql';
import { codegen } from '@graphql-codegen/core';
import { plugin, addToSchema } from '../src';

// TODO: make sure we don't duplicate federation spec (directives, scalars)
// TODO: support multiple the same directives on a FIELD and OBJECT_TYPE (@key @key) - might be tricky...

describe('TypeScript Resolvers Plugin + Apollo Federation', () => {
  it('should add __resolveReference to objects that have @key', async () => {
    const federatedSchema = parse(/* GraphQL */ `
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
    `);

    const content = await codegen({
      filename: 'graphql.ts',
      schema: federatedSchema,
      documents: [],
      plugins: [
        {
          'typescript-resolvers': {},
        },
      ],
      config: {
        federation: true,
      },
      pluginMap: {
        'typescript-resolvers': {
          plugin,
          addToSchema,
        },
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, ({ id: ParentType["id"] }), ContextType>,
    `);
    // Foo shouldn't because it doesn't have @key
    expect(content).not.toBeSimilarStringTo(`
      __resolveReference?: Resolver<Maybe<ResolversTypes['Book']>, ParentType, ContextType>,
    `);
  });

  it('should support extend keyword', async () => {
    const federatedSchema = parse(/* GraphQL */ `
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
    `);

    const content = await codegen({
      filename: 'graphql.ts',
      schema: federatedSchema,
      documents: [],
      plugins: [
        {
          'typescript-resolvers': {},
        },
      ],
      config: {
        federation: true,
      },
      pluginMap: {
        'typescript-resolvers': {
          plugin,
          addToSchema,
        },
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, ({ id: ParentType["id"] }), ContextType>,
    `);
    // Foo shouldn't because it doesn't have @key
    expect(content).not.toBeSimilarStringTo(`
      __resolveReference?: Resolver<Maybe<ResolversTypes['Book']>, ParentType, ContextType>,
    `);
  });

  it('should include fields from @requires directive', async () => {
    const federatedSchema = parse(/* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String @external
        age: Int! @external
        username: String @requires(fields: "name age")
      }
    `);

    const content = await codegen({
      filename: 'graphql.ts',
      schema: federatedSchema,
      documents: [],
      plugins: [
        {
          'typescript-resolvers': {},
        },
      ],
      config: {
        federation: true,
      },
      pluginMap: {
        'typescript-resolvers': {
          plugin,
          addToSchema,
        },
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, ({ id: ParentType["id"] }), ContextType>,
        id?: Resolver<ResolversTypes['ID'], ({ id: ParentType["id"] }), ContextType>,
        username?: Resolver<Maybe<ResolversTypes['String']>, ({ id: ParentType["id"] }) & { name?: ParentType["name"]; age: ParentType["age"] }, ContextType>,
      };
    `);
  });

  it('should skip to generate resolvers of fields with @external directive', async () => {
    const federatedSchema = parse(/* GraphQL */ `
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
    `);

    const content = await codegen({
      filename: 'graphql.ts',
      schema: federatedSchema,
      documents: [],
      plugins: [
        {
          'typescript-resolvers': {},
        },
      ],
      config: {
        federation: true,
      },
      pluginMap: {
        'typescript-resolvers': {
          plugin,
          addToSchema,
        },
      },
    });

    // UserResolver should not have a resolver function of name field
    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, ({ id: ParentType["id"] }), ContextType>,
        id?: Resolver<ResolversTypes['ID'], ({ id: ParentType["id"] }), ContextType>,
        name?: Resolver<Maybe<ResolversTypes['String']>, ({ id: ParentType["id"] }), ContextType>,
      };
    `);
  });

  it('should not include _FieldSet scalar', async () => {
    const federatedSchema = parse(/* GraphQL */ `
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
    `);

    const content = await codegen({
      filename: 'graphql.ts',
      schema: federatedSchema,
      documents: [],
      plugins: [
        {
          'typescript-resolvers': {},
        },
      ],
      config: {
        federation: true,
      },
      pluginMap: {
        'typescript-resolvers': {
          plugin,
          addToSchema,
        },
      },
    });

    expect(content).not.toMatch(`_FieldSet`);
  });

  it('should not include federation directives', async () => {
    const federatedSchema = parse(/* GraphQL */ `
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
    `);

    const content = await codegen({
      filename: 'graphql.ts',
      schema: federatedSchema,
      documents: [],
      plugins: [
        {
          'typescript-resolvers': {},
        },
      ],
      config: {
        federation: true,
      },
      pluginMap: {
        'typescript-resolvers': {
          plugin,
          addToSchema,
        },
      },
    });

    expect(content).not.toMatch('ExternalDirectiveResolver');
    expect(content).not.toMatch('RequiresDirectiveResolver');
    expect(content).not.toMatch('ProvidesDirectiveResolver');
    expect(content).not.toMatch('KeyDirectiveResolver');
  });

  it('should not add directive definitions and scalars if they are already there', async () => {
    const federatedSchema = parse(/* GraphQL */ `
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
    `);

    const content = await codegen({
      filename: 'graphql.ts',
      schema: federatedSchema,
      documents: [],
      plugins: [
        {
          'typescript-resolvers': {},
        },
      ],
      config: {
        federation: true,
      },
      pluginMap: {
        'typescript-resolvers': {
          plugin,
          addToSchema,
        },
      },
    });

    expect(content).not.toMatch(`_FieldSet`);
    expect(content).not.toMatch('ExternalDirectiveResolver');
    expect(content).not.toMatch('RequiresDirectiveResolver');
    expect(content).not.toMatch('ProvidesDirectiveResolver');
    expect(content).not.toMatch('KeyDirectiveResolver');
  });
});
