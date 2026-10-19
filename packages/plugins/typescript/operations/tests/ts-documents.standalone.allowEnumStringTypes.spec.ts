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

  it('adds string values union to enum variables when enumType is native-with-string-values', async () => {
    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        { enumType: 'native-with-string-values' },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export enum TargetType {
        A = 'A',
        B = 'B'
      }

      export type GetTargetsQueryVariables = Exact<{
        id: string;
        type: TargetType | \`\${TargetType}\`;
      }>;


      export type GetTargetsQuery = { getTargets: Array<string> };
      "
    `);
  });

  it('keeps plain enum type in variables when enumType is native', async () => {
    const result = mergeOutputs([
      await plugin(schema, [{ document }], { enumType: 'native' }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export enum TargetType {
        A = 'A',
        B = 'B'
      }

      export type GetTargetsQueryVariables = Exact<{
        id: string;
        type: TargetType;
      }>;


      export type GetTargetsQuery = { getTargets: Array<string> };
      "
    `);
  });
});
