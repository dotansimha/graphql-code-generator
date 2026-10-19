import { buildSchema, parse } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - allowEnumStringTypes', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Query {
      getTargets(id: String!, type: TargetType!): [String!]!
    }

    enum TargetType {
      A
      B
    }
  `);
  const document = parse(/* GraphQL */ `
    query getTargets($id: String!, $type: TargetType!) {
      getTargets(id: $id, type: $type)
    }
  `);

  it('adds template literal union to enum variables when allowEnumStringTypes is true', async () => {
    const result = mergeOutputs([
      await plugin(schema, [{ document }], { allowEnumStringTypes: true }, { outputFile: '' }),
    ]);

    expect(result).toContain('type: TargetType | `${TargetType}`;');
  });

  it('keeps plain enum type in variables when allowEnumStringTypes is unset', async () => {
    const result = mergeOutputs([await plugin(schema, [{ document }], {}, { outputFile: '' })]);

    expect(result).toContain('type: TargetType;');
    expect(result).not.toContain('${TargetType}');
  });
});
