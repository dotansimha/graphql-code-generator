import '@graphql-codegen/testing';
import { parse } from 'graphql';
import { codegen } from '@graphql-codegen/core';
import { plugin, addToSchema } from '../src';

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

    interface User {
      id: string;
      name: string;
      username: string;
    }

    // User should have it
    expect(content).toBeSimilarStringTo(`
      __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, (Pick<ParentType, 'id'>), ContextType>,
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
      __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, (Pick<ParentType, 'id'>), ContextType>,
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
        __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, (Pick<ParentType, 'id'>), ContextType>,
        id?: Resolver<ResolversTypes['ID'], (Pick<ParentType, 'id'>), ContextType>,
        username?: Resolver<Maybe<ResolversTypes['String']>, (Pick<ParentType, 'id'>) & Pick<ParentType, 'name' | 'age'>, ContextType>,
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
        __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, (Pick<ParentType, 'id'>), ContextType>,
        id?: Resolver<ResolversTypes['ID'], (Pick<ParentType, 'id'>), ContextType>,
        name?: Resolver<Maybe<ResolversTypes['String']>, (Pick<ParentType, 'id'>), ContextType>,
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

  it('should allow for duplicated directives', async () => {
    const federatedSchema = parse(/* GraphQL */ `
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
        __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, (Pick<ParentType, 'id'> | Pick<ParentType, 'name'>), ContextType>,
        id?: Resolver<ResolversTypes['ID'], (Pick<ParentType, 'id'> | Pick<ParentType, 'name'>), ContextType>,
        name?: Resolver<Maybe<ResolversTypes['String']>, (Pick<ParentType, 'id'> | Pick<ParentType, 'name'>), ContextType>,
        username?: Resolver<Maybe<ResolversTypes['String']>, (Pick<ParentType, 'id'> | Pick<ParentType, 'name'>), ContextType>,
      };
    `);
  });

  it.skip('should only extend an original type by a mapped type', async () => {
    const federatedSchema = parse(/* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
        age: Int!
        username: String
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
        mappers: {
          User: 'UserExtension',
        },
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
        __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, (Pick<ParentType, 'id'>), ContextType>,
        id?: Resolver<ResolversTypes['ID'], UserExtension & (Pick<ParentType, 'id'>), ContextType>,
        username?: Resolver<Maybe<ResolversTypes['String']>, UserExtension & (Pick<ParentType, 'id'>) & Pick<ParentType, 'name', 'age'>, ContextType>,
      };
    `);
  });
});
