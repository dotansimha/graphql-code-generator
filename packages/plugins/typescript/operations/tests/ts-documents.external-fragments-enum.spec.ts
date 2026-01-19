import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - External Fragments with Enums', () => {
  it('should include enum in document when enum is used in external fragment', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user: User
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
        profile: UserProfile!
      }

      type UserProfile {
        bio: String!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
        GUEST
      }
    `);

    // Fragment defined separately (external fragment)
    const fragmentDocument = parse(/* GraphQL */ `
      fragment UserFields on User {
        role
        profile {
          bio
        }
      }
    `);

    // Query that uses the external fragment
    const queryDocument = parse(/* GraphQL */ `
      query GetUser {
        user {
          id
          ...UserFields
        }
      }
    `);

    const fragmentDef = fragmentDocument.definitions[0];
    if (fragmentDef.kind !== 'FragmentDefinition') {
      throw new Error('Expected fragment definition');
    }

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document: queryDocument }],
        {
          enumType: 'native',
          externalFragments: [
            {
              node: fragmentDef,
              name: 'UserFields',
              onType: 'User',
              isExternal: true,
            },
          ],
        },
        { outputFile: '' }
      ),
    ]);

    // The enum should be included in the output
    expect(result).toContain('export enum UserRole');
    expect(result).toContain("Admin = 'ADMIN'");
    expect(result).toContain("Customer = 'CUSTOMER'");
    expect(result).toContain("Guest = 'GUEST'");

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('should include enum in document when enum is nested deeply in external fragment', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        organization: Organization
      }

      type Organization {
        id: ID!
        users: [User!]!
      }

      type User {
        id: ID!
        manager: Manager!
      }

      type Manager {
        id: ID!
        roleType: ManagerRole!
      }

      enum ManagerRole {
        SENIOR
        JUNIOR
        LEAD
      }
    `);

    const fragmentDocument = parse(/* GraphQL */ `
      fragment ManagerFields on User {
        manager {
          id
          roleType
        }
      }
    `);

    const queryDocument = parse(/* GraphQL */ `
      query GetOrganization {
        organization {
          id
          users {
            id
            ...ManagerFields
          }
        }
      }
    `);

    const fragmentDef = fragmentDocument.definitions[0];
    if (fragmentDef.kind !== 'FragmentDefinition') {
      throw new Error('Expected fragment definition');
    }

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document: queryDocument }],
        {
          enumType: 'native',
          externalFragments: [
            {
              node: fragmentDef,
              name: 'ManagerFields',
              onType: 'User',
              isExternal: true,
            },
          ],
        },
        { outputFile: '' }
      ),
    ]);

    // The enum should be included even though it's nested deeply
    expect(result).toContain('export enum ManagerRole');
    expect(result).toContain("Senior = 'SENIOR'");
    expect(result).toContain("Junior = 'JUNIOR'");
    expect(result).toContain("Lead = 'LEAD'");

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('should include multiple enums from multiple external fragments', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user: User
      }

      type User {
        id: ID!
        role: UserRole!
        status: UserStatus!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }

      enum UserStatus {
        ACTIVE
        INACTIVE
      }
    `);

    const roleFragmentDocument = parse(/* GraphQL */ `
      fragment RoleFields on User {
        role
      }
    `);

    const statusFragmentDocument = parse(/* GraphQL */ `
      fragment StatusFields on User {
        status
      }
    `);

    const queryDocument = parse(/* GraphQL */ `
      query GetUser {
        user {
          id
          ...RoleFields
          ...StatusFields
        }
      }
    `);

    const roleFragmentDef = roleFragmentDocument.definitions[0];
    const statusFragmentDef = statusFragmentDocument.definitions[0];

    if (roleFragmentDef.kind !== 'FragmentDefinition' || statusFragmentDef.kind !== 'FragmentDefinition') {
      throw new Error('Expected fragment definitions');
    }

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document: queryDocument }],
        {
          enumType: 'native',
          externalFragments: [
            {
              node: roleFragmentDef,
              name: 'RoleFields',
              onType: 'User',
              isExternal: true,
            },
            {
              node: statusFragmentDef,
              name: 'StatusFields',
              onType: 'User',
              isExternal: true,
            },
          ],
        },
        { outputFile: '' }
      ),
    ]);

    // Both enums should be included
    expect(result).toContain('export enum UserRole');
    expect(result).toContain("Admin = 'ADMIN'");
    expect(result).toContain("Customer = 'CUSTOMER'");

    expect(result).toContain('export enum UserStatus');
    expect(result).toContain("Active = 'ACTIVE'");
    expect(result).toContain("Inactive = 'INACTIVE'");

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('should not duplicate enum if it appears in both query and external fragment', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user: User
        admin: User
      }

      type User {
        id: ID!
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }
    `);

    const fragmentDocument = parse(/* GraphQL */ `
      fragment UserFields on User {
        role
      }
    `);

    const queryDocument = parse(/* GraphQL */ `
      query GetUsers {
        user {
          id
          ...UserFields
        }
        admin {
          id
          role
        }
      }
    `);

    const fragmentDef = fragmentDocument.definitions[0];
    if (fragmentDef.kind !== 'FragmentDefinition') {
      throw new Error('Expected fragment definition');
    }

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document: queryDocument }],
        {
          enumType: 'native',
          externalFragments: [
            {
              node: fragmentDef,
              name: 'UserFields',
              onType: 'User',
              isExternal: true,
            },
          ],
        },
        { outputFile: '' }
      ),
    ]);

    // The enum should appear only once
    const enumMatches = result.match(/export enum UserRole/g);
    expect(enumMatches).toHaveLength(1);

    expect(result).toContain('export enum UserRole');
    expect(result).toContain("Admin = 'ADMIN'");
    expect(result).toContain("Customer = 'CUSTOMER'");

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('should handle external fragment with nested fragment spread containing enum', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user: User
      }

      type User {
        id: ID!
        profile: UserProfile!
      }

      type UserProfile {
        id: ID!
        visibility: Visibility!
      }

      enum Visibility {
        PUBLIC
        PRIVATE
        FRIENDS_ONLY
      }
    `);

    const profileFragmentDocument = parse(/* GraphQL */ `
      fragment ProfileVisibility on UserProfile {
        visibility
      }
    `);

    const userFragmentDocument = parse(/* GraphQL */ `
      fragment UserWithProfile on User {
        id
        profile {
          ...ProfileVisibility
        }
      }
    `);

    const queryDocument = parse(/* GraphQL */ `
      query GetUser {
        user {
          ...UserWithProfile
        }
      }
    `);

    const profileFragmentDef = profileFragmentDocument.definitions[0];
    const userFragmentDef = userFragmentDocument.definitions[0];

    if (profileFragmentDef.kind !== 'FragmentDefinition' || userFragmentDef.kind !== 'FragmentDefinition') {
      throw new Error('Expected fragment definitions');
    }

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document: queryDocument }],
        {
          enumType: 'native',
          externalFragments: [
            {
              node: profileFragmentDef,
              name: 'ProfileVisibility',
              onType: 'UserProfile',
              isExternal: true,
            },
            {
              node: userFragmentDef,
              name: 'UserWithProfile',
              onType: 'User',
              isExternal: true,
            },
          ],
        },
        { outputFile: '' }
      ),
    ]);

    // The enum should be included even with nested fragment spreads
    expect(result).toContain('export enum Visibility');
    expect(result).toContain("Public = 'PUBLIC'");
    expect(result).toContain("Private = 'PRIVATE'");
    expect(result).toContain("FriendsOnly = 'FRIENDS_ONLY'");

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('should include enum with const enum type from external fragment', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user: User
      }

      type User {
        id: ID!
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }
    `);

    const fragmentDocument = parse(/* GraphQL */ `
      fragment UserFields on User {
        role
      }
    `);

    const queryDocument = parse(/* GraphQL */ `
      query GetUser {
        user {
          id
          ...UserFields
        }
      }
    `);

    const fragmentDef = fragmentDocument.definitions[0];
    if (fragmentDef.kind !== 'FragmentDefinition') {
      throw new Error('Expected fragment definition');
    }

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document: queryDocument }],
        {
          enumType: 'const',
          externalFragments: [
            {
              node: fragmentDef,
              name: 'UserFields',
              onType: 'User',
              isExternal: true,
            },
          ],
        },
        { outputFile: '' }
      ),
    ]);

    // The enum should be included as const object
    expect(result).toContain('export const UserRole = {');
    expect(result).toContain("Admin: 'ADMIN'");
    expect(result).toContain("Customer: 'CUSTOMER'");
    expect(result).toContain('} as const;');
    expect(result).toContain('export type UserRole = typeof UserRole[keyof typeof UserRole];');

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
