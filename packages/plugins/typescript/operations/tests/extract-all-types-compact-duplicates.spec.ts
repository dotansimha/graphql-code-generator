import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin, type TypeScriptDocumentsPluginConfig } from '../src/index.js';

describe('extractAllFieldsToTypesCompact: duplicate type names', () => {
  const validate = async (content: Types.PluginOutput) => {
    const m = mergeOutputs([content]);
    validateTs(m, undefined, undefined, undefined, []);

    return m;
  };

  it('should add type suffix to disambiguate duplicate fragment type names in union types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        typeDefinitions: [TypeDefinition!]!
      }

      interface TypeDefinition {
        identifier: String!
      }

      type StringType implements TypeDefinition {
        identifier: String!
      }

      type IntType implements TypeDefinition {
        identifier: String!
        min: Int
        max: Int
      }

      type ArrayType implements TypeDefinition {
        identifier: String!
        elementTypeId: String!
      }

      type BooleanType implements TypeDefinition {
        identifier: String!
      }
    `);

    const document = parse(/* GraphQL */ `
      fragment TypeDefinitions on TypeDefinition {
        __typename
        ... on StringType {
          identifier
        }
        ... on IntType {
          identifier
          min
          max
        }
        ... on ArrayType {
          identifier
          elementTypeId
        }
        ... on BooleanType {
          identifier
        }
      }
    `);

    const config: TypeScriptDocumentsPluginConfig = {
      extractAllFieldsToTypesCompact: true,
      printFieldsOnNewLines: true,
      nonOptionalTypename: true,
      fragmentSuffix: '',
    };

    const { content } = await plugin(schema, [{ location: 'test-file.ts', document }], config, { outputFile: '' });

    await validate(content);

    // Should generate unique type names with type suffixes
    expect(content).toContain('type TypeDefinitions_StringType_Fragment = {');
    expect(content).toContain('type TypeDefinitions_IntType_Fragment = {');
    expect(content).toContain('type TypeDefinitions_ArrayType_Fragment = {');
    expect(content).toContain('type TypeDefinitions_BooleanType_Fragment = {');

    // Should generate a union type referencing the unique names
    expect(content).toContain('export type TypeDefinitionsFragment =');
    expect(content).toContain('| TypeDefinitions_StringType_Fragment');
    expect(content).toContain('| TypeDefinitions_IntType_Fragment');
    expect(content).toContain('| TypeDefinitions_ArrayType_Fragment');
    expect(content).toContain('| TypeDefinitions_BooleanType_Fragment');

    // Should NOT have duplicate type declarations with the same name
    const typeDeclarationRegex = /type TypeDefinitions_StringType_Fragment = \{/g;
    const matches = content.match(typeDeclarationRegex);
    expect(matches).toHaveLength(1); // Should appear exactly once
  });

  it('should handle nested fields with parameters in union fragments', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        typeDefinitions: [TypeDefinition!]!
      }

      interface TypeDefinition {
        identifier: String!
      }

      type Parameter {
        name: String!
      }

      type StructType implements TypeDefinition {
        identifier: String!
        parameters: [Parameter!]!
      }

      type FunctionType implements TypeDefinition {
        identifier: String!
        parameters: [Parameter!]!
      }
    `);

    const document = parse(/* GraphQL */ `
      fragment ParameterDetails on Parameter {
        __typename
      }

      fragment TypeDefinitions on TypeDefinition {
        __typename
        ... on StructType {
          identifier
          parameters {
            ...ParameterDetails
          }
        }
        ... on FunctionType {
          identifier
          parameters {
            ...ParameterDetails
          }
        }
      }
    `);

    const config: TypeScriptDocumentsPluginConfig = {
      extractAllFieldsToTypesCompact: true,
      printFieldsOnNewLines: true,
      nonOptionalTypename: true,
      fragmentSuffix: '',
    };

    const { content } = await plugin(schema, [{ location: 'test-file.ts', document }], config, { outputFile: '' });

    await validate(content);

    // Should generate unique names for the main types
    expect(content).toContain('type TypeDefinitions_StructType_Fragment = {');
    expect(content).toContain('type TypeDefinitions_FunctionType_Fragment = {');

    // Should generate a union type
    expect(content).toContain('export type TypeDefinitionsFragment =');
    expect(content).toContain('| TypeDefinitions_StructType_Fragment');
    expect(content).toContain('| TypeDefinitions_FunctionType_Fragment');

    // Verify there are no duplicate type declarations
    const structTypeRegex = /type TypeDefinitions_StructType_Fragment = \{/g;
    const structMatches = content.match(structTypeRegex);
    expect(structMatches).toHaveLength(1);

    const functionTypeRegex = /type TypeDefinitions_FunctionType_Fragment = \{/g;
    const functionMatches = content.match(functionTypeRegex);
    expect(functionMatches).toHaveLength(1);
  });

  it('should not add type suffix when there is only one inline fragment', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user: User
      }

      interface User {
        id: ID!
      }

      type PremiumUser implements User {
        id: ID!
        isPremium: Boolean!
      }
    `);

    const document = parse(/* GraphQL */ `
      fragment UserFragment on User {
        __typename
        ... on PremiumUser {
          id
          isPremium
        }
      }
    `);

    const config: TypeScriptDocumentsPluginConfig = {
      extractAllFieldsToTypesCompact: true,
      printFieldsOnNewLines: true,
      nonOptionalTypename: true,
      fragmentSuffix: '',
    };

    const { content } = await plugin(schema, [{ location: 'test-file.ts', document }], config, { outputFile: '' });

    await validate(content);

    // With only one inline fragment, should use the base name without type suffix
    expect(content).toContain('export type UserFragmentFragment = {');
    expect(content).not.toContain('UserFragment_PremiumUser_Fragment');
  });

  it('should handle complex union with many types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        shapes: [Shape!]!
      }

      interface Shape {
        id: ID!
      }

      type Circle implements Shape {
        id: ID!
        radius: Float!
      }

      type Rectangle implements Shape {
        id: ID!
        width: Float!
        height: Float!
      }

      type Triangle implements Shape {
        id: ID!
        base: Float!
        height: Float!
      }

      type Square implements Shape {
        id: ID!
        side: Float!
      }

      type Polygon implements Shape {
        id: ID!
        sides: Int!
        vertices: [Float!]!
      }

      type Ellipse implements Shape {
        id: ID!
        majorAxis: Float!
        minorAxis: Float!
      }

      type Pentagon implements Shape {
        id: ID!
        side: Float!
      }
    `);

    const document = parse(/* GraphQL */ `
      fragment ShapeDetails on Shape {
        __typename
        ... on Circle {
          id
          radius
        }
        ... on Rectangle {
          id
          width
          height
        }
        ... on Triangle {
          id
          base
          height
        }
        ... on Square {
          id
          side
        }
        ... on Polygon {
          id
          sides
          vertices
        }
        ... on Ellipse {
          id
          majorAxis
          minorAxis
        }
        ... on Pentagon {
          id
          side
        }
      }
    `);

    const config: TypeScriptDocumentsPluginConfig = {
      extractAllFieldsToTypesCompact: true,
      printFieldsOnNewLines: true,
      nonOptionalTypename: true,
      fragmentSuffix: '',
    };

    const { content } = await plugin(schema, [{ location: 'test-file.ts', document }], config, { outputFile: '' });

    await validate(content);

    // Verify all unique type names exist
    expect(content).toContain('type ShapeDetails_Circle_Fragment');
    expect(content).toContain('type ShapeDetails_Rectangle_Fragment');
    expect(content).toContain('type ShapeDetails_Triangle_Fragment');
    expect(content).toContain('type ShapeDetails_Square_Fragment');
    expect(content).toContain('type ShapeDetails_Polygon_Fragment');
    expect(content).toContain('type ShapeDetails_Ellipse_Fragment');
    expect(content).toContain('type ShapeDetails_Pentagon_Fragment');

    // Verify union type exists
    expect(content).toContain('export type ShapeDetailsFragment =');

    // Verify all types are in the union
    expect(content).toContain('| ShapeDetails_Circle_Fragment');
    expect(content).toContain('| ShapeDetails_Rectangle_Fragment');
    expect(content).toContain('| ShapeDetails_Triangle_Fragment');
    expect(content).toContain('| ShapeDetails_Square_Fragment');
    expect(content).toContain('| ShapeDetails_Polygon_Fragment');
    expect(content).toContain('| ShapeDetails_Ellipse_Fragment');
    expect(content).toContain('| ShapeDetails_Pentagon_Fragment');

    // Verify there are no duplicate type declarations
    const circleTypeRegex = /type ShapeDetails_Circle_Fragment = \{/g;
    const circleMatches = content.match(circleTypeRegex);
    expect(circleMatches).toHaveLength(1);
  });
});
