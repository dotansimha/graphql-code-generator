import { buildSchema } from 'graphql';
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
});
