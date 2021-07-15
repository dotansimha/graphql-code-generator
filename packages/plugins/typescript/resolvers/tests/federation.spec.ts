import { compileTs } from '@graphql-codegen/testing';
import { parse } from 'graphql';
import { codegen } from '@graphql-codegen/core';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { plugin } from '../src';
import { TypeScriptResolversPluginConfig } from '../src/config';
import { JsxEmit, ScriptTarget } from 'typescript';

function compile(content: string) {
  compileTs(
    content,
    {
      jsx: JsxEmit.None,
      target: ScriptTarget.ES2018,
      allowJs: false,
      skipLibCheck: true,
    },
    /* tsx */ false,
    /* playground */ false,
    /* flag to enable diagnostics*/ true
  );
}

function generate({ schema, config }: { schema: string; config: TypeScriptResolversPluginConfig }) {
  return codegen({
    filename: 'graphql.ts',
    schema: parse(schema),
    documents: [],
    plugins: [
      {
        typescript: {},
      },
      {
        'typescript-resolvers': {},
      },
    ],
    config,
    pluginMap: {
      typescript: {
        plugin: tsPlugin,
      },
      'typescript-resolvers': {
        plugin,
      },
    },
  });
}

describe('TypeScript Resolvers Plugin + Apollo Federation', () => {
  it('should add __resolveReference to objects with @key', async () => {
    const federatedSchema = /* GraphQL */ `
      type User @key(fields: "id") @key(fields: "username name { first last }") {
        id: ID!
        username: String!
        name: Name!
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

    // Name has no `@key`
    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          Name: {
            __resolveReference() {}
          }
        };
      `)
    ).toThrowError(`'__resolveReference' does not exist in type 'NameResolvers`);

    // User has `@key`
    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          User: {
            __resolveReference() {
              return {} as any;
            }
          }
        };
      `)
    ).not.toThrowError(`'__resolveReference' does not exist in type 'UserResolvers`);
  });

  it('__resolveReference should use a union of @key directives', async () => {
    const federatedSchema = /* GraphQL */ `
      type User @key(fields: "id") @key(fields: "username name { first last }") {
        id: ID!
        username: String!
        name: Name!
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

    // user.id. should not be available because it's a union and id is missing in second union member
    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          User: {
            __resolveReference(obj) {
              obj.id
              return {} as any;
            }
          }
        };
      `)
    ).toThrowError(`Property 'id' does not exist on type`);

    // user.username. should not be available because it's a union and username is missing in first union member
    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          User: {
            __resolveReference(obj) {
              obj.username
              return {} as any;
            }
          }
        };
      `)
    ).toThrowError(`Property 'username' does not exist on type`);

    // make sure it's a union
    expect(() =>
      compile(`
      ${content}
      const resolvers: Resolvers = {
        User: {
          __resolveReference(obj) {
            if ('username' in obj){
              obj.name.first
            } else {
              obj.id
            }
            return {} as any;
          }
        }
      };
    `)
    ).not.toThrow();
  });

  test('only fields specified by @requires should be available in parent object', async () => {
    const federatedSchema = /* GraphQL */ `
      type Post {
        author: User! @requires(fields: "username")
      }

      type User @key(fields: "id") {
        id: ID!
        username: String!
        email: String!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // User.email should not be available
    expect(() =>
      compile(`
      ${content}
      const resolvers: Resolvers = {
        Post: {
          author(obj) {
            obj.email
            return {} as any;
          }
        }
      };
    `)
    ).toThrow(`Property 'email' does not exist on type`);

    // User.id and User.name should be available
    expect(() =>
      compile(`
      ${content}
      const resolvers: Resolvers = {
        Post: {
          author(obj) {
            obj.id
            obj.name
            return {} as any;
          }
        }
      };
    `)
    ).not.toThrow();
  });

  test('do not create resolvers for @external fields', async () => {
    const federatedSchema = /* GraphQL */ `
      type Review {
        product: Product @provides(fields: "name")
      }

      extend type Product @key(fields: "upc") {
        upc: String! @external
        name: String! @external
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          Product: {
            upc() {
              return {} as any;
            }
          }
        };
      `)
    ).toThrow(`'upc' does not exist in type`);

    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          Review: {
            product() {
              return {} as any;
            }
          }
        };
      `)
    ).not.toThrow();
  });

  test('should accept a reference', async () => {
    const federatedSchema = /* GraphQL */ `
      type Review @key(fields: "id") {
        id: ID!
        product: Product! @provides(fields: "name")
      }

      extend type Product @key(fields: "id") {
        id: String! @external
        name: String! @external
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          Review: {
            product() {
              return {
                __typename: 'Product'
              };
            }
          }
        };
      `)
    ).toThrowError(`missing the following properties`);

    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          Review: {
            product() {
              return {
                __typename: 'Product',
                id: 'pid'
              };
            }
          }
        };
      `)
    ).not.toThrow();
  });

  test('should accept a reference based on union of @key directives', async () => {
    const federatedSchema = /* GraphQL */ `
      type Review @key(fields: "id") {
        id: ID!
        product: Product!
      }

      extend type Product @key(fields: "id") @key(fields: "name") {
        id: String! @external
        name: String! @external
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          Review: {
            product() {
              return {
                __typename: 'Product'
              };
            }
          }
        };
      `)
    ).toThrowError(`missing the following properties`);

    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          Review: {
            product() {
              return {
                __typename: 'Product',
                id: 'product'
              };
            }
          }
        };
      `)
    ).not.toThrow();

    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          Review: {
            product() {
              return {
                __typename: 'Product',
                name: 'product'
              };
            }
          }
        };
      `)
    ).not.toThrow();
  });

  test('should NOT accept a reference on an external type without @key', async () => {
    const federatedSchema = /* GraphQL */ `
      type Review @key(fields: "id") {
        id: ID!
        product: Product!
      }

      extend type Product {
        id: String! @external
        name: String! @external
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          Review: {
            product() {
              return {
                __typename: 'Product',
                id: 'product',
              };
            }
          }
        };
      `)
    ).toThrowError();
  });

  test('should NOT accept a reference on an external type (with @extends) without @key', async () => {
    const federatedSchema = /* GraphQL */ `
      type Review @key(fields: "id") {
        id: ID!
        product: Product!
      }

      type Product @extends {
        id: String! @external
        name: String! @external
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          Review: {
            product() {
              return {
                __typename: 'Product',
                id: 'product',
              };
            }
          }
        };
      `)
    ).toThrowError();
  });

  test('should NOT accept a reference on a local (non-external) type', async () => {
    const federatedSchema = /* GraphQL */ `
      type Review {
        id: ID!
        product: Product!
      }

      type Product {
        id: String!
        name: String!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(() =>
      compile(`
        ${content}
        const resolvers: Resolvers = {
          Review: {
            product() {
              return {
                __typename: 'Product',
                id: 'product',
              };
            }
          }
        };
      `)
    ).toThrowError();
  });

  test.todo('support __resolveObject');
  test.todo('should mapper apply to __resolveReference as output?');
  test.todo('should mapper apply to __resolveReference as input?');
  test.todo('mappers should not collide with references - both accepted');
  test.todo(
    'check if Federation allows to resolve a custom object and if so then what data goes to other services - is it the custom object or an object matching GraphQL type.'
  );

  // Old tests

  it.skip('should add __resolveReference to objects that have @key', async () => {
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
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
    `);
    // Foo shouldn't because it doesn't have @key
    expect(content).not.toBeSimilarStringTo(`
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Book']>, { __typename: 'Book' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
    `);
  });

  it.skip('should support extend keyword', async () => {
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
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
    `);
    // Foo shouldn't because it doesn't have @key
    expect(content).not.toBeSimilarStringTo(`
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Book']>, { __typename: 'Book' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
    `);
  });

  it.skip('should include fields from @requires directive', async () => {
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
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}> & GraphQLRecursivePick<ParentType, {"name":true,"age":true}>, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);
  });

  it.skip('should handle nested fields from @requires directive', async () => {
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
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}> & GraphQLRecursivePick<ParentType, {"name":true,"age":true,"address":{"street":true}}>, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);
  });

  it.skip('should handle nested fields from @key directive', async () => {
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
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"name":{"first":true,"last":true}}>, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"name":{"first":true,"last":true}}>, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);
  });

  it.skip('should not apply key/requires fields restriction for base federated types', async () => {
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
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"name":{"first":true,"last":true}}>, ContextType>;
        name?: Resolver<ResolversTypes['Name'], ParentType, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);
  });

  it.skip('should handle interface types', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        people: [Person]
      }

      extend interface Person @key(fields: "name { first last }") {
        name: Name! @external
        age: Int @requires(fields: "name")
      }

      extend type User implements Person @key(fields: "name { first last }") {
        name: Name! @external
        age: Int @requires(fields: "name { first last }")
        username: String
      }

      type Admin implements Person @key(fields: "name { first last }") {
        name: Name! @external
        age: Int @requires(fields: "name { first last }")
        permissions: [String!]!
      }

      extend type Name {
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
    export type PersonResolvers<ContextType = any, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']> = {
      __resolveType: TypeResolveFn<'User' | 'Admin', ParentType, ContextType>;
      age?: Resolver<Maybe<ResolversTypes['Int']>, { __typename: 'User' | 'Admin' } & GraphQLRecursivePick<ParentType, {"name":{"first":true,"last":true}}>, ContextType>;
    };
    `);
  });

  it.skip('should skip to generate resolvers of fields with @external directive', async () => {
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
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
        name?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);
  });

  it.skip('should not include _FieldSet scalar', async () => {
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

  it.skip('should not include federation directives', async () => {
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

  it.skip('should not add directive definitions and scalars if they are already there', async () => {
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

  it.skip('should allow for duplicated directives', async () => {
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
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & (GraphQLRecursivePick<ParentType, {"id":true}> | GraphQLRecursivePick<ParentType, {"name":true}>), ContextType>;
        name?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & (GraphQLRecursivePick<ParentType, {"id":true}> | GraphQLRecursivePick<ParentType, {"name":true}>), ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, { __typename: 'User' } & (GraphQLRecursivePick<ParentType, {"id":true}> | GraphQLRecursivePick<ParentType, {"name":true}>), ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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

  it.skip('should not generate unused scalars', async () => {
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

  describe.skip('When field definition wrapping is enabled', () => {
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
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<UnwrappedObject<ParentType>, {"id":true}>, ContextType>;
      `);
      // but ID should not
      expect(content).toBeSimilarStringTo(`id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>`);
    });
  });
});
