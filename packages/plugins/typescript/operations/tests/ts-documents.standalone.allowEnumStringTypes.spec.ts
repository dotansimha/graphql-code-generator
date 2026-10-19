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

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type TargetType =
        | 'A'
        | 'B';

      export type GetTargetsQueryVariables = Exact<{
        id: string;
        type: TargetType | \`\${TargetType}\`;
      }>;


      export type GetTargetsQuery = { getTargets: Array<string> };
      "
    `);
  });

  it('keeps plain enum type in variables when allowEnumStringTypes is unset', async () => {
    const result = mergeOutputs([await plugin(schema, [{ document }], {}, { outputFile: '' })]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type TargetType =
        | 'A'
        | 'B';

      export type GetTargetsQueryVariables = Exact<{
        id: string;
        type: TargetType;
      }>;


      export type GetTargetsQuery = { getTargets: Array<string> };
      "
    `);
  });
});
