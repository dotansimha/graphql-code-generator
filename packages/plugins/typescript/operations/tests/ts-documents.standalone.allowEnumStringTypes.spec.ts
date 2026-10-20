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

  describe('enumType: native-with-string-values', () => {
    const schemaWithInput = buildSchema(/* GraphQL */ `
      type Query {
        search(filter: SearchFilter, type: TargetType, types: [TargetType!]): [TargetType!]!
      }

      enum TargetType {
        A
        B
      }

      input SearchFilter {
        type: TargetType!
        optionalType: TargetType
        types: [TargetType]
      }
    `);
    const searchDocument = parse(/* GraphQL */ `
      query search($filter: SearchFilter, $type: TargetType, $types: [TargetType!]) {
        search(filter: $filter, type: $type, types: $types)
      }
    `);

    it('adds string values union to input object enum fields', async () => {
      const result = mergeOutputs([
        await plugin(
          schemaWithInput,
          [{ document: searchDocument }],
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

        export type SearchFilter = {
          type: TargetType | \`\${TargetType}\`;
          optionalType?: TargetType | \`\${TargetType}\` | null | undefined;
          types?: Array<TargetType | \`\${TargetType}\` | null | undefined> | null | undefined;
        };

        export type SearchQueryVariables = Exact<{
          filter?: SearchFilter | null | undefined;
          type?: TargetType | \`\${TargetType}\` | null | undefined;
          types?: Array<TargetType | \`\${TargetType}\`> | TargetType | \`\${TargetType}\` | null | undefined;
        }>;


        export type SearchQuery = { search: Array<TargetType> };
        "
      `);
    });

    it('adds string values union to nullable and list enum variables', async () => {
      const result = mergeOutputs([
        await plugin(
          schemaWithInput,
          [{ document: searchDocument }],
          { enumType: 'native-with-string-values', arrayInputCoercion: false },
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

        export type SearchFilter = {
          type: TargetType | \`\${TargetType}\`;
          optionalType?: TargetType | \`\${TargetType}\` | null | undefined;
          types?: Array<TargetType | \`\${TargetType}\` | null | undefined> | null | undefined;
        };

        export type SearchQueryVariables = Exact<{
          filter?: SearchFilter | null | undefined;
          type?: TargetType | \`\${TargetType}\` | null | undefined;
          types?: Array<TargetType | \`\${TargetType}\`> | null | undefined;
        }>;


        export type SearchQuery = { search: Array<TargetType> };
        "
      `);
    });

    it('does not add future added value to inputs with futureProofEnums, matching native', async () => {
      const result = mergeOutputs([
        await plugin(
          schemaWithInput,
          [{ document: searchDocument }],
          { enumType: 'native-with-string-values', futureProofEnums: true },
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

        export type SearchFilter = {
          type: TargetType | \`\${TargetType}\`;
          optionalType?: TargetType | \`\${TargetType}\` | null | undefined;
          types?: Array<TargetType | \`\${TargetType}\` | null | undefined> | null | undefined;
        };

        export type SearchQueryVariables = Exact<{
          filter?: SearchFilter | null | undefined;
          type?: TargetType | \`\${TargetType}\` | null | undefined;
          types?: Array<TargetType | \`\${TargetType}\`> | TargetType | \`\${TargetType}\` | null | undefined;
        }>;


        export type SearchQuery = { search: Array<TargetType> };
        "
      `);
    });
  });
});
