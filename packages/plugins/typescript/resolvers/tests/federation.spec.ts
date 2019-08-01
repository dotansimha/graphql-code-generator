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

// TODO: we shouldn't produce a resolver for `_FieldSet`
// TODO: we shouldn't produce `_FieldSetScalarConfig`
// TODO: we shouldn't produce directive resolvers for those from apollo federation
// TODO: we shouldn't produce ResolversTypes._FieldSet and ResolversParentTypes._FieldSet
// TODO: support `extend type Query { }`
// TODO: make it possible to not include @key and other federation directives
// TODO: Objects with `@key` directives should have additional `__resolveReference` field
// TODO: Fields marked `@external` cannot have resolvers defined for them, unless they are also marked `@provided` by some other field:
// TODO: https://github.com/apollographql/apollo-tooling/pull/1432/files#diff-ef0c8ff73747d34b126f39eebaf1f91aR109
// TODO: Fields with a `@requires` directive will have access to the given fields in their resolver functions:
// TODO: https://github.com/apollographql/apollo-tooling/pull/1432/files#diff-ef0c8ff73747d34b126f39eebaf1f91aR133
// TODO: should make sure fields from @key directive are non optional and included in the parent type

describe('TypeScript Resolvers Plugin + Apollo Federation', () => {
  it('should add __resolveReference to objects that have @key', async () => {
    const federatedSchema = buildSchema(/* GraphQL */ `
      ${directives}

      type Query {
        me: User
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
      __resolveReference?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>,
    `);
    // Foo shouldn't because it doesn't have @key
    expect(content.content).not.toBeSimilarStringTo(`
      __resolveReference?: Resolver<Maybe<ResolversTypes['Foo']>, ParentType, ContextType>,
    `);
  });
});
