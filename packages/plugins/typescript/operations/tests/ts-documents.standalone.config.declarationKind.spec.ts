import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

const warnSpy = vi.spyOn(console, 'warn');

describe('TypeScript Operations Plugin - config.declarationKind', () => {
  beforeEach(() => {
    warnSpy.mockReset();
    warnSpy.mockImplementation(() => {});
  });

  it('generates interface for Input and Result when declarationKind:interface', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }
      type Mutation {
        updateUser(id: ID!, changes: UpdateUserChangesInput!): User
      }
      type Subscription {
        userUpdates(id: ID!): User
      }

      input UpdateUserChangesInput {
        name: String
        role: UserRole
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }

      mutation UpdateUser($input: UpdateUserChangesInput!) {
        updateUser(id: "100", input: $input) {
          id
          name
        }
      }

      subscription UserUpdates {
        userUpdates(id: "200") {
          id
          name
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { declarationKind: 'interface' }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export interface UpdateUserChangesInput {
        name?: string | null | undefined;
        role?: UserRole | null | undefined;
      }

      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type UserQueryVariables = Exact<{
        id: string | number;
      }>;


      export interface UserQuery { user: { id: string, name: string } | null }

      export type UpdateUserMutationVariables = Exact<{
        input: UpdateUserChangesInput;
      }>;


      export interface UpdateUserMutation { updateUser: { id: string, name: string } | null }

      export type UserUpdatesSubscriptionVariables = Exact<{ [key: string]: never; }>;


      export interface UserUpdatesSubscription { userUpdates: { id: string, name: string } | null }
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles partial object option correctly', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }
      type Mutation {
        updateUser(id: ID!, changes: UpdateUserChangesInput!): User
      }
      type Subscription {
        userUpdates(id: ID!): User
      }

      input UpdateUserChangesInput {
        name: String
        role: UserRole
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }

      mutation UpdateUser($input: UpdateUserChangesInput!) {
        updateUser(id: "100", input: $input) {
          id
          name
        }
      }

      subscription UserUpdates {
        userUpdates(id: "200") {
          id
          name
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          declarationKind: {
            result: 'interface', // `result` value is `interface`, and `input` value is `type` (default)
          },
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UpdateUserChangesInput = {
        name?: string | null | undefined;
        role?: UserRole | null | undefined;
      };

      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type UserQueryVariables = Exact<{
        id: string | number;
      }>;


      export interface UserQuery { user: { id: string, name: string } | null }

      export type UpdateUserMutationVariables = Exact<{
        input: UpdateUserChangesInput;
      }>;


      export interface UpdateUserMutation { updateUser: { id: string, name: string } | null }

      export type UserUpdatesSubscriptionVariables = Exact<{ [key: string]: never; }>;


      export interface UserUpdatesSubscription { userUpdates: { id: string, name: string } | null }
      "
    `);
  });

  it('generates type for Result when declarationKind.result:interface but extractAllFieldsToTypes:true, but warns user', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }
      type Mutation {
        updateUser(id: ID!, changes: UpdateUserChangesInput!): User
      }
      type Subscription {
        userUpdates(id: ID!): User
      }

      input UpdateUserChangesInput {
        name: String
        role: UserRole
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }

      mutation UpdateUser($input: UpdateUserChangesInput!) {
        updateUser(id: "100", input: $input) {
          id
          name
        }
      }

      subscription UserUpdates {
        userUpdates(id: "200") {
          id
          name
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          extractAllFieldsToTypes: true,
          declarationKind: 'interface',
        },
        { outputFile: '' }
      ),
    ]);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenNthCalledWith(
      1,
      "`declarationKind.result` has been set to `'type'` because `extractAllFieldsToTypes` or `extractAllFieldsToTypesCompact` is true"
    );

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export interface UpdateUserChangesInput {
        name?: string | null | undefined;
        role?: UserRole | null | undefined;
      }

      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type UserQuery_user_User = { id: string, name: string };

      export type UserQuery_Query = { user: UserQuery_user_User | null };


      export type UserQueryVariables = Exact<{
        id: string | number;
      }>;


      export type UserQuery = UserQuery_Query;

      export type UpdateUserMutation_updateUser_User = { id: string, name: string };

      export type UpdateUserMutation_Mutation = { updateUser: UpdateUserMutation_updateUser_User | null };


      export type UpdateUserMutationVariables = Exact<{
        input: UpdateUserChangesInput;
      }>;


      export type UpdateUserMutation = UpdateUserMutation_Mutation;

      export type UserUpdatesSubscription_userUpdates_User = { id: string, name: string };

      export type UserUpdatesSubscription_Subscription = { userUpdates: UserUpdatesSubscription_userUpdates_User | null };


      export type UserUpdatesSubscriptionVariables = Exact<{ [key: string]: never; }>;


      export type UserUpdatesSubscription = UserUpdatesSubscription_Subscription;
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('generates type for Result when declarationKind.result:interface and extractAllFieldsToTypesCompact:true, but warns user', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }
      type Mutation {
        updateUser(id: ID!, changes: UpdateUserChangesInput!): User
      }
      type Subscription {
        userUpdates(id: ID!): User
      }

      input UpdateUserChangesInput {
        name: String
        role: UserRole
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }

      mutation UpdateUser($input: UpdateUserChangesInput!) {
        updateUser(id: "100", input: $input) {
          id
          name
        }
      }

      subscription UserUpdates {
        userUpdates(id: "200") {
          id
          name
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          extractAllFieldsToTypesCompact: true,
          declarationKind: 'interface',
        },
        { outputFile: '' }
      ),
    ]);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenNthCalledWith(
      1,
      "`declarationKind.result` has been set to `'type'` because `extractAllFieldsToTypes` or `extractAllFieldsToTypesCompact` is true"
    );

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export interface UpdateUserChangesInput {
        name?: string | null | undefined;
        role?: UserRole | null | undefined;
      }

      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type UserQuery_user = { id: string, name: string };

      export type UserQuery = { user: UserQuery_user | null };


      export type UserQueryVariables = Exact<{
        id: string | number;
      }>;

      export type UpdateUserMutation_updateUser = { id: string, name: string };

      export type UpdateUserMutation = { updateUser: UpdateUserMutation_updateUser | null };


      export type UpdateUserMutationVariables = Exact<{
        input: UpdateUserChangesInput;
      }>;

      export type UserUpdatesSubscription_userUpdates = { id: string, name: string };

      export type UserUpdatesSubscription = { userUpdates: UserUpdatesSubscription_userUpdates | null };


      export type UserUpdatesSubscriptionVariables = Exact<{ [key: string]: never; }>;
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
