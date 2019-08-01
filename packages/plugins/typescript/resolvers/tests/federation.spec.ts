import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { validate } from './common';
import { Types } from '@graphql-codegen/plugin-helpers';

const directives = /* GraphQL */ `
  scalar _FieldSet

  directive @external on FIELD_DEFINITION
  directive @requires(fields: _FieldSet!) on FIELD_DEFINITION
  directive @provides(fields: _FieldSet!) on FIELD_DEFINITION
  directive @key(fields: _FieldSet!) on OBJECT | INTERFACE
`;

// TODO: [ ] we shouldn't produce a resolver for `_FieldSet`
// TODO: [ ] we shouldn't produce `_FieldSetScalarConfig`
// TODO: [ ] we shouldn't produce directive resolvers for those from apollo federation
// TODO: [ ] we shouldn't produce ResolversTypes._FieldSet and ResolversParentTypes._FieldSet
// TODO: [ ] support `extend type Query { }`
// TODO: [ ] make it possible to not include @key and other federation directives
// TODO: [x] Objects with `@key` directives should have additional `__resolveReference` field
// TODO: [x] Fields marked `@external` cannot have resolvers defined for them
// TODO: [ ] Fields marked `@external` cannot have resolvers defined for them unless they are also marked `@provides` by some other field:
//            - we could use a visitor to look for `@provides` that is on top of a field that returns a matching type
// TODO: [ ] https://github.com/apollographql/apollo-tooling/pull/1432/files#diff-ef0c8ff73747d34b126f39eebaf1f91aR109
// TODO: [ ] Fields with a `@requires` directive will have access to the given fields in their resolver functions:
// TODO: [ ] https://github.com/apollographql/apollo-tooling/pull/1432/files#diff-ef0c8ff73747d34b126f39eebaf1f91aR133
// TODO: [x] should make sure fields from @key directive are non optional and included in the parent type

describe('TypeScript Resolvers Plugin + Apollo Federation', () => {
  it('should add __resolveReference to objects that have @key', async () => {
    const federatedSchema = buildSchema(/* GraphQL */ `
      ${directives}

      type Query {
        allUsers: [User]
      }
      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }

      type Foo {
        id: ID!
      }
    `);

    const content = (await plugin(
      federatedSchema,
      [],
      {
        federation: true,
      } as any,
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    // User should have it
    expect(content.content).toBeSimilarStringTo(`
      __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, ParentType & ({ id: ParentType['id'] }), ContextType>,
    `);
    // Foo shouldn't because it doesn't have @key
    expect(content.content).not.toBeSimilarStringTo(`
      __resolveReference?: Resolver<Maybe<ResolversTypes['Foo']>, ParentType, ContextType>,
    `);
  });

  it('should skip to generate resolvers of fields with @external directive', async () => {
    const federatedSchema = buildSchema(/* GraphQL */ `
      ${directives}

      type Query {
        allUsers: [User]
      }
      type User @key(fields: "id") {
        id: ID!
        name: String @external
        username: String
      }

      type Foo {
        id: ID!
      }
    `);

    const content = (await plugin(
      federatedSchema,
      [],
      {
        federation: true,
      } as any,
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    // UserResolver should not have a resolver function of name field
    expect(content.content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType = ResolversParentTypes['User']> = {
        __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, ParentType & ({ id: ParentType['id'] }), ContextType>,
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
        username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
      };
    `);
  });
});
