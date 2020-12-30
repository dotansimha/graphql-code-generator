import { buildSchema, GraphQLEnumType, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { parseEnumValues } from '../src/enum-values';

describe('enumValues', () => {
  const schema = buildSchema(/* GraphQL */ `
    enum Test {
      A
      B
      C
    }

    type Query {
      test: Test
    }
  `);

  it('should work with namespaces', () => {
    const result = parseEnumValues({
      schema,
      mapOrStr: {
        Test: `my-file#SomeNamespace.ETest`,
      },
    });

    expect(result).toEqual({
      Test: {
        isDefault: false,
        typeIdentifier: 'Test',
        sourceFile: 'my-file',
        sourceIdentifier: 'SomeNamespace.ETest',
        importIdentifier: 'SomeNamespace',
        mappedValues: null,
      },
    });
  });

  it('should work with regular type', () => {
    const result = parseEnumValues({
      schema,
      mapOrStr: {
        Test: `my-file#ETest`,
      },
    });

    expect(result).toEqual({
      Test: {
        isDefault: false,
        typeIdentifier: 'Test',
        sourceFile: 'my-file',
        sourceIdentifier: 'ETest',
        importIdentifier: 'ETest',
        mappedValues: null,
      },
    });
  });

  it('should work with aliased type', () => {
    const result = parseEnumValues({
      schema,
      mapOrStr: {
        Test: `my-file#ETest as Something`,
      },
    });

    expect(result).toEqual({
      Test: {
        isDefault: false,
        typeIdentifier: 'Test',
        sourceFile: 'my-file',
        sourceIdentifier: 'Something',
        importIdentifier: 'ETest as Something',
        mappedValues: null,
      },
    });
  });
  const schemaWithEnumValues = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        test: {
          type: new GraphQLEnumType({
            name: 'Test',
            values: {
              A: {
                value: 'a',
              },
              B: {
                value: 'b',
              },
              C: {
                value: 'c',
              },
            },
          }),
        },
      },
    }),
  });
  it('should respect enum values from schema', () => {
    const result = parseEnumValues({
      schema: schemaWithEnumValues,
      mapOrStr: {},
      ignoreEnumValuesFromSchema: false,
    });

    expect(result).toEqual({
      Test: {
        isDefault: false,
        typeIdentifier: 'Test',
        sourceFile: null,
        importIdentifier: null,
        sourceIdentifier: null,
        mappedValues: {
          A: 'a',
          B: 'b',
          C: 'c',
        },
      },
    });
  });

  it('should ignore enum values from schema', () => {
    const result = parseEnumValues({
      schema: schemaWithEnumValues,
      mapOrStr: {},
      ignoreEnumValuesFromSchema: true,
    });

    expect(result).not.toEqual({
      Test: {
        isDefault: false,
        typeIdentifier: 'Test',
        sourceFile: null,
        importIdentifier: null,
        sourceIdentifier: null,
        mappedValues: {
          A: 'a',
          B: 'b',
          C: 'c',
        },
      },
    });
  });
});
