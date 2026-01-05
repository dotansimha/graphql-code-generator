import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin as tsPlugin } from '../../typescript/src/index.js';
import { plugin, TypeScriptDocumentsPluginConfig } from '../src/index.js';

describe('extractAllFieldsToTypesFieldNamesOnly: true', () => {
  const validate = async (content: Types.PluginOutput, config: any = {}, pluginSchema: any) => {
    const m = mergeOutputs([await tsPlugin(pluginSchema, [], config, { outputFile: '' }), content]);
    validateTs(m, undefined, undefined, undefined, []);

    return m;
  };

  // Test schema similar to the example in prompt.md
  const fooSchema = buildSchema(/* GraphQL */ `
    type Query {
      foo(id: ID!): Foo
    }

    type Foo {
      id: ID!
      name: String!
      rating: Float
      numCount: Int
      location: FooLocation
    }

    type FooLocation {
      id: ID
      address: FooAddress
    }

    type FooAddress {
      formatted: String
    }
  `);

  const fooDoc = parse(/* GraphQL */ `
    query FooDemoGetBarInfo($id: ID!) {
      foo(id: $id) {
        id
        name
        rating
        numCount
        location {
          id
          address {
            formatted
          }
        }
      }
    }
  `);

  it('should generate Apollo Tooling-compatible type names (field names only, without GraphQL type names)', async () => {
    const config: TypeScriptDocumentsPluginConfig = {
      extractAllFieldsToTypes: true,
      extractAllFieldsToTypesFieldNamesOnly: true,
      printFieldsOnNewLines: true,
      omitOperationSuffix: true,
    };
    const { content } = await plugin(fooSchema, [{ location: 'test-file.ts', document: fooDoc }], config, {
      outputFile: '',
    });

    await validate(content, config, fooSchema);

    // Check that type names follow Apollo Tooling pattern: QueryName_fieldName_nestedField
    // NOT the default pattern: QueryName_fieldName_TypeName_nestedField_FieldTypeName
    expect(content).toContain('FooDemoGetBarInfo_foo_location_address');
    expect(content).toContain('FooDemoGetBarInfo_foo_location');
    expect(content).toContain('FooDemoGetBarInfo_foo');

    // Make sure it does NOT contain the GraphQL type names in the field type names
    expect(content).not.toContain('FooDemoGetBarInfo_foo_Foo_location');
    expect(content).not.toContain('FooLocation_address_FooAddress');

    // Make sure it does NOT contain the Query suffix in extracted field types
    expect(content).not.toContain('FooDemoGetBarInfoQuery_foo_location');

    expect(content).toMatchInlineSnapshot(`
      "export type FooDemoGetBarInfo_foo_location_address = {
        formatted: string | null
      };

      export type FooDemoGetBarInfo_foo_location = {
        id: string | null,
        address: FooDemoGetBarInfo_foo_location_address | null
      };

      export type FooDemoGetBarInfo_foo = {
        id: string,
        name: string,
        rating: number | null,
        numCount: number | null,
        location: FooDemoGetBarInfo_foo_location | null
      };

      export type FooDemoGetBarInfo = {
        foo: FooDemoGetBarInfo_foo | null
      };


      export type FooDemoGetBarInfoVariables = Exact<{
        id: string;
      }>;


      export type FooDemoGetBarInfo = FooDemoGetBarInfo;
      "
    `);
  });

  it('should work with fragments and field names only mode', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user: User
      }

      interface User {
        id: ID!
      }

      type AdminUser implements User {
        id: ID!
        profile: UserProfile
      }

      type RegularUser implements User {
        id: ID!
        profile: UserProfile
      }

      type UserProfile {
        bio: String
        avatar: Avatar
      }

      type Avatar {
        url: String!
      }
    `);

    const doc = parse(/* GraphQL */ `
      fragment UserProfileFragment on UserProfile {
        bio
        avatar {
          url
        }
      }

      query GetUser {
        user {
          id
          ... on AdminUser {
            profile {
              ...UserProfileFragment
            }
          }
        }
      }
    `);

    const config: TypeScriptDocumentsPluginConfig = {
      extractAllFieldsToTypes: true,
      extractAllFieldsToTypesFieldNamesOnly: true,
      printFieldsOnNewLines: true,
      omitOperationSuffix: true,
    };

    const { content } = await plugin(schema, [{ location: 'test-file.ts', document: doc }], config, {
      outputFile: '',
    });

    await validate(content, config, schema);

    // Verify field names only pattern
    expect(content).toContain('UserProfileFragment_avatar');
    expect(content).toContain('GetUser_user_profile');

    // Verify type names are NOT included
    expect(content).not.toContain('UserProfileFragment_avatar_Avatar');
    expect(content).not.toContain('UserProfile_avatar_Avatar');
    expect(content).not.toContain('GetUser_user_AdminUser_profile');

    // Make sure operation suffix is omitted
    expect(content).not.toContain('GetUserQuery_user_profile');
    expect(content).not.toContain('UserProfileFragmentFragment_avatar');
  });

  it('should not affect type names when extractAllFieldsToTypes is false', async () => {
    const config: TypeScriptDocumentsPluginConfig = {
      extractAllFieldsToTypes: false,
      extractAllFieldsToTypesFieldNamesOnly: true, // This should have no effect on extraction, but still affects operation suffix
      printFieldsOnNewLines: true,
      omitOperationSuffix: true,
    };

    const { content } = await plugin(fooSchema, [{ location: 'test-file.ts', document: fooDoc }], config, {
      outputFile: '',
    });

    await validate(content, config, fooSchema);

    // When extractAllFieldsToTypes is false, types should be inlined
    // Field types are not extracted
    expect(content).not.toContain('FooDemoGetBarInfo_foo_location_address');

    // But the operation suffix should still be omitted since extractAllFieldsToTypesFieldNamesOnly affects getOperationSuffix
    expect(content).toContain('FooDemoGetBarInfo');
    expect(content).not.toContain('FooDemoGetBarInfoQuery {');
  });

  it('should handle deeply nested fields with field names only', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        root: Level1
      }

      type Level1 {
        field1: Level2
      }

      type Level2 {
        field2: Level3
      }

      type Level3 {
        field3: Level4
      }

      type Level4 {
        value: String!
      }
    `);

    const doc = parse(/* GraphQL */ `
      query DeeplyNested {
        root {
          field1 {
            field2 {
              field3 {
                value
              }
            }
          }
        }
      }
    `);

    const config: TypeScriptDocumentsPluginConfig = {
      extractAllFieldsToTypes: true,
      extractAllFieldsToTypesFieldNamesOnly: true,
      printFieldsOnNewLines: true,
      omitOperationSuffix: true,
    };

    const { content } = await plugin(schema, [{ location: 'test-file.ts', document: doc }], config, {
      outputFile: '',
    });

    await validate(content, config, schema);

    // Check Apollo Tooling style: QueryName_field1_field2_field3
    expect(content).toContain('DeeplyNested_root_field1_field2_field3');
    expect(content).toContain('DeeplyNested_root_field1_field2');
    expect(content).toContain('DeeplyNested_root_field1');
    expect(content).toContain('DeeplyNested_root');

    // Check that type names are NOT included
    expect(content).not.toContain('DeeplyNested_root_Level1_field1');
    expect(content).not.toContain('Level2_field2_Level3');

    // Make sure Query suffix is omitted
    expect(content).not.toContain('DeeplyNestedQuery_root_field1');
  });
});
