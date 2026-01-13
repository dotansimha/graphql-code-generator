import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - Standalone', () => {
  it('generates using default config', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
        users(input: UsersInput!): UsersResponse!
      }

      type ResponseError {
        error: ResponseErrorType!
      }

      enum ResponseErrorType {
        NOT_FOUND
        INPUT_VALIDATION_ERROR
        FORBIDDEN_ERROR
        UNEXPECTED_ERROR
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
        createdAt: DateTime!
        nickname: String
      }

      "UserRole Description"
      enum UserRole {
        "UserRole ADMIN"
        ADMIN
        "UserRole CUSTOMER"
        CUSTOMER
      }

      "UsersInput Description"
      input UsersInput {
        "UsersInput from"
        from: DateTime
        "UsersInput to"
        to: DateTime
        role: UserRole
      }

      type UsersResponseOk {
        result: [User!]!
      }
      union UsersResponse = UsersResponseOk | ResponseError

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          id
          name
          role
          createdAt
          nickname
        }
      }

      query Users($input: UsersInput!) {
        users(input: $input) {
          ... on UsersResponseOk {
            result {
              id
            }
          }
          ... on ResponseError {
            error
          }
        }
      }

      query UsersWithScalarInput($from: DateTime!, $to: DateTime, $role: UserRole) {
        users(input: { from: $from, to: $to, role: $role }) {
          ... on UsersResponseOk {
            result {
              __typename
            }
          }
          ... on ResponseError {
            __typename
          }
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], {}, { outputFile: '' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type ResponseErrorType =
        | 'NOT_FOUND'
        | 'INPUT_VALIDATION_ERROR'
        | 'FORBIDDEN_ERROR'
        | 'UNEXPECTED_ERROR';

      /** UserRole Description */
      export type UserRole =
        /** UserRole ADMIN */
        | 'ADMIN'
        /** UserRole CUSTOMER */
        | 'CUSTOMER';

      /** UsersInput Description */
      type UsersInput = {
        /** UsersInput from */
        from?: any;
        /** UsersInput to */
        to?: any;
        role?: UserRole | null | undefined;
      };

      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { user: { id: string, name: string, role: UserRole, createdAt: any, nickname: string | null } | null };

      export type UsersQueryVariables = Exact<{
        input: UsersInput;
      }>;


      export type UsersQuery = { users:
          | { result: Array<{ id: string }> }
          | { error: ResponseErrorType }
         };

      export type UsersWithScalarInputQueryVariables = Exact<{
        from: any;
        to?: any | null;
        role?: UserRole | null;
      }>;


      export type UsersWithScalarInputQuery = { users:
          | { result: Array<{ __typename: 'User' }> }
          | { __typename: 'ResponseError' }
         };
      "
    `);

    // FIXME: enable this to ensure type correctness
    // validateTs(content, undefined, undefined, undefined, undefined, true);
  });

  it('test generating input types enums in lists and inner field', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        users(input: UsersInput!): [User!]!
      }

      type User {
        id: ID!
      }

      enum EnumRoot {
        ENUM_A
        ENUM_B
      }

      enum EnumRootArray {
        ENUM_C
        ENUM_D
      }

      enum EnumInnerArray {
        ENUM_E
        ENUM_F
      }

      input EnumsInner {
        enumsDeep: [EnumInnerArray!]!
      }

      input UsersInput {
        enum: EnumRoot!
        enums: [EnumRootArray!]!
        innerEnums: EnumsInner!
      }
    `);
    const document = parse(/* GraphQL */ `
      query Users($input: UsersInput!) {
        users(input: $input) {
          id
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], {}, { outputFile: '' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type EnumRoot =
        | 'ENUM_A'
        | 'ENUM_B';

      export type EnumRootArray =
        | 'ENUM_C'
        | 'ENUM_D';

      export type EnumInnerArray =
        | 'ENUM_E'
        | 'ENUM_F';

      type EnumsInner = {
        enumsDeep: Array<EnumInnerArray>;
      };

      type UsersInput = {
        enum: EnumRoot;
        enums: Array<EnumRootArray>;
        innerEnums: EnumsInner;
      };

      export type UsersQueryVariables = Exact<{
        input: UsersInput;
      }>;


      export type UsersQuery = { users: Array<{ id: string }> };
      "
    `);
  });

  it('test generating output enums in lists and inner field', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User!
      }

      enum EnumRoot {
        ENUM_A
        ENUM_B
      }

      enum EnumRootArray {
        ENUM_C
        ENUM_D
      }

      enum EnumInnerArray {
        ENUM_E
        ENUM_F
      }

      type EnumsInner {
        enumsDeep: [EnumInnerArray!]!
      }

      type User {
        enum: EnumRoot!
        enums: [EnumRootArray!]!
        innerEnums: EnumsInner!
      }
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          enum
          enums
          innerEnums {
            enumsDeep
          }
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          extractAllFieldsToTypes: true, // Extracts all fields to separate types (similar to apollo-codegen behavior)
          printFieldsOnNewLines: true, // Prints each field on a new line (similar to apollo-codegen behavior)
        },
        {
          outputFile: '',
        }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type EnumRoot =
        | 'ENUM_A'
        | 'ENUM_B';

      export type EnumRootArray =
        | 'ENUM_C'
        | 'ENUM_D';

      export type EnumInnerArray =
        | 'ENUM_E'
        | 'ENUM_F';

      export type UserQuery_user_User_innerEnums_EnumsInner = {
        enumsDeep: Array<EnumInnerArray>
      };

      export type UserQuery_user_User = {
        enum: EnumRoot,
        enums: Array<EnumRootArray>,
        innerEnums: UserQuery_user_User_innerEnums_EnumsInner
      };

      export type UserQuery_Query = {
        user: UserQuery_user_User
      };


      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = UserQuery_Query;
      "
    `);
  });

  it('test overrdiding config.scalars', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        name: String!
      }
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { scalars: { ID: 'string | number | boolean' } }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{
        id: string | number | boolean;
      }>;


      export type UserQuery = { user: { id: string | number | boolean, name: string } | null };
      "
    `);
  });

  it('test render output enum from fragment in the same document', async () => {
    const schema = buildSchema(/* GraphQL */ `
      enum RoleType {
        ROLE_A
        ROLE_B
      }

      type User {
        id: ID!
        name: String!
        role: RoleType
        pictureUrl: String
      }

      type Query {
        users: [User!]!
        viewer: User!
      }
    `);
    const document = parse(/* GraphQL */ `
      fragment UserBasic on User {
        id
        name
        role
      }

      query GetUsersAndViewer {
        users {
          ...UserBasic
        }
        viewer {
          ...UserBasic
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], {}, { outputFile: '' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type RoleType =
        | 'ROLE_A'
        | 'ROLE_B';

      export type UserBasicFragment = { id: string, name: string, role: RoleType | null };

      export type GetUsersAndViewerQueryVariables = Exact<{ [key: string]: never; }>;


      export type GetUsersAndViewerQuery = { users: Array<{ id: string, name: string, role: RoleType | null }>, viewer: { id: string, name: string, role: RoleType | null } };
      "
    `);
  });

  it('test render output enum from fragment in a separate document', async () => {
    const schema = buildSchema(/* GraphQL */ `
      enum RoleType {
        ROLE_A
        ROLE_B
      }

      type User {
        id: ID!
        name: String!
        role: RoleType
        pictureUrl: String
      }

      type Query {
        users: [User!]!
        viewer: User!
      }
    `);

    const documentWithFragment = parse(/* GraphQL */ `
      fragment UserBasic on User {
        id
        name
        role
      }
    `);

    const documentMain = parse(/* GraphQL */ `
      query GetUsersAndViewer {
        users {
          ...UserBasic
        }
        viewer {
          ...UserBasic
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document: documentMain }, { document: documentWithFragment }], {}, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type RoleType =
        | 'ROLE_A'
        | 'ROLE_B';

      export type GetUsersAndViewerQueryVariables = Exact<{ [key: string]: never; }>;


      export type GetUsersAndViewerQuery = { users: Array<{ id: string, name: string, role: RoleType | null }>, viewer: { id: string, name: string, role: RoleType | null } };

      export type UserBasicFragment = { id: string, name: string, role: RoleType | null };
      "
    `);
  });

  it('does not generate Variables, Result or Fragments when generatesOperationTypes is false', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
        users(input: UsersInput!): UsersResponse!
      }

      type Mutation {
        makeUserAdmin(id: ID!): User!
      }

      type Subscription {
        userChanges(id: ID!): User!
      }

      type ResponseError {
        error: ResponseErrorType!
      }

      enum ResponseErrorType {
        NOT_FOUND
        INPUT_VALIDATION_ERROR
        FORBIDDEN_ERROR
        UNEXPECTED_ERROR
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
        createdAt: DateTime!
      }

      "UserRole Description"
      enum UserRole {
        "UserRole ADMIN"
        ADMIN
        "UserRole CUSTOMER"
        CUSTOMER
      }

      "UsersInput Description"
      input UsersInput {
        "UsersInput from"
        from: DateTime
        "UsersInput to"
        to: DateTime
        role: UserRole
      }

      type UsersResponseOk {
        result: [User!]!
      }
      union UsersResponse = UsersResponseOk | ResponseError

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          id
          name
          role
          createdAt
        }
      }

      query Users($input: UsersInput!) {
        users(input: $input) {
          ... on UsersResponseOk {
            result {
              ...UserFragment
            }
          }
          ... on ResponseError {
            error
          }
        }
      }

      query UsersWithScalarInput($from: DateTime!, $to: DateTime, $role: UserRole) {
        users(input: { from: $from, to: $to, role: $role }) {
          ... on UsersResponseOk {
            result {
              __typename
            }
          }
          ... on ResponseError {
            __typename
          }
        }
      }

      mutation MakeAdmin {
        makeUserAdmin(id: "100") {
          ...UserFragment
        }
      }

      subscription UserChanges {
        makeUserAdmin(id: "100") {
          ...UserFragment
        }
      }

      fragment UserFragment on User {
        id
        role
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { generatesOperationTypes: false }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "

      export type ResponseErrorType =
        | 'NOT_FOUND'
        | 'INPUT_VALIDATION_ERROR'
        | 'FORBIDDEN_ERROR'
        | 'UNEXPECTED_ERROR';

      /** UserRole Description */
      export type UserRole =
        /** UserRole ADMIN */
        | 'ADMIN'
        /** UserRole CUSTOMER */
        | 'CUSTOMER';

      /** UsersInput Description */
      type UsersInput = {
        /** UsersInput from */
        from?: any;
        /** UsersInput to */
        to?: any;
        role?: UserRole | null | undefined;
      };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('does not generate unused schema enum and input types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
        users(input: UsersInput!): UsersResponse!
      }

      type Mutation {
        makeUserAdmin(id: ID!): User!
      }

      type Subscription {
        userChanges(id: ID!): User!
      }

      type ResponseError {
        error: ResponseErrorType!
      }

      enum ResponseErrorType {
        NOT_FOUND
        INPUT_VALIDATION_ERROR
        FORBIDDEN_ERROR
        UNEXPECTED_ERROR
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
        createdAt: DateTime!
      }

      "UserRole Description"
      enum UserRole {
        "UserRole ADMIN"
        ADMIN
        "UserRole CUSTOMER"
        CUSTOMER
      }

      "UsersInput Description"
      input UsersInput {
        "UsersInput from"
        from: DateTime
        "UsersInput to"
        to: DateTime
        role: UserRole
      }

      type UsersResponseOk {
        result: [User!]!
      }
      union UsersResponse = UsersResponseOk | ResponseError

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User {
        user(id: "100") {
          id
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { generatesOperationTypes: false }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "

      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('adds __typename correctly for Apollo Client when skipTypeNameForRoot:true, nonOptionalTypename:true are used', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
        createdAt: DateTime!
        bestFriend: User
        goodFriends: [User!]!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          id
          name
          createdAt
          bestFriend {
            name
          }
          goodFriends {
            id
            __typename
          }
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          skipTypeNameForRoot: true,
          nonOptionalTypename: true,
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { user: { __typename: 'User', id: string, name: string, createdAt: any, bestFriend: { __typename: 'User', name: string } | null, goodFriends: Array<{ __typename: 'User', id: string }> } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
