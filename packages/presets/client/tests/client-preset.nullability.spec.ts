import '@graphql-codegen/testing';
import { executeCodegen } from '@graphql-codegen/cli';
import * as prettier from 'prettier';
import { preset } from '../src/index.js';

const schema = /* GraphQL */ `
  directive @semanticNonNull(levels: [Int] = [0]) on FIELD_DEFINITION

  type Query {
    me: User
  }

  type User {
    field: String @semanticNonNull
    fieldLevel0: String @semanticNonNull(levels: [0])
    fieldLevel1: String @semanticNonNull(levels: [1])
    fieldBothLevels: String @semanticNonNull(levels: [0, 1])
    list: [String] @semanticNonNull
    listLevel0: [String] @semanticNonNull(levels: [0])
    listLevel1: [String] @semanticNonNull(levels: [1])
    listBothLevels: [String] @semanticNonNull(levels: [0, 1])
    nonNullableList: [String]! @semanticNonNull
    nonNullableListLevel0: [String]! @semanticNonNull(levels: [0])
    nonNullableListLevel1: [String]! @semanticNonNull(levels: [1])
    nonNullableListBothLevels: [String]! @semanticNonNull(levels: [0, 1])
    listWithNonNullableItem: [String!] @semanticNonNull
    listWithNonNullableItemLevel0: [String!] @semanticNonNull(levels: [0])
    listWithNonNullableItemLevel1: [String!] @semanticNonNull(levels: [1])
    listWithNonNullableItemBothLevels: [String!] @semanticNonNull(levels: [0, 1])
    nonNullableListWithNonNullableItem: [String!]! @semanticNonNull
    nonNullableListWithNonNullableItemLevel0: [String!]! @semanticNonNull(levels: [0])
    nonNullableListWithNonNullableItemLevel1: [String!]! @semanticNonNull(levels: [1])
    nonNullableListWithNonNullableItemBothLevels: [String!]! @semanticNonNull(levels: [0, 1])
  }
`;

const document = /* GraphQL */ `
  query Test {
    me {
      field
      fieldLevel0
      fieldLevel1
      fieldBothLevels
      list
      listLevel0
      listLevel1
      listBothLevels
      nonNullableList
      nonNullableListLevel0
      nonNullableListLevel1
      nonNullableListBothLevels
      listWithNonNullableItem
      listWithNonNullableItemLevel0
      listWithNonNullableItemLevel1
      listWithNonNullableItemBothLevels
      nonNullableListWithNonNullableItem
      nonNullableListWithNonNullableItemLevel0
      nonNullableListWithNonNullableItemLevel1
      nonNullableListWithNonNullableItemBothLevels
    }
  }
`;

describe('client-preset - nullability', () => {
  it('converts semanticNonNull to non-null when nullability.errorHandlingClient=true', async () => {
    const { result } = await executeCodegen({
      schema,
      documents: [document],
      generates: {
        'out1/': {
          preset,
          config: {
            nullability: {
              errorHandlingClient: true,
            },
          },
        },
      },
    });

    const graphqlFile = result.find(f => f.filename === 'out1/graphql.ts');
    const formattedContent = prettier.format(graphqlFile.content, { parser: 'typescript' });

    expect(formattedContent).toBeSimilarStringTo(`
      export type TestQuery = {
        __typename?: "Query";
        me?: {
          __typename?: "User";
          field: string;
          fieldLevel0: string;
          fieldLevel1?: string | null;
          fieldBothLevels: string;
          list: Array<string | null>;
          listLevel0: Array<string | null>;
          listLevel1?: Array<string> | null;
          listBothLevels: Array<string>;
          nonNullableList: Array<string | null>;
          nonNullableListLevel0: Array<string | null>;
          nonNullableListLevel1: Array<string>;
          nonNullableListBothLevels: Array<string>;
          listWithNonNullableItem: Array<string>;
          listWithNonNullableItemLevel0: Array<string>;
          listWithNonNullableItemLevel1?: Array<string> | null;
          listWithNonNullableItemBothLevels: Array<string>;
          nonNullableListWithNonNullableItem: Array<string>;
          nonNullableListWithNonNullableItemLevel0: Array<string>;
          nonNullableListWithNonNullableItemLevel1: Array<string>;
          nonNullableListWithNonNullableItemBothLevels: Array<string>;
        } | null;
      };
    `);
  });

  it('leave semanticNonNull as null when nullability.errorHandlingClient=false', async () => {
    const { result } = await executeCodegen({
      schema,
      documents: [document],
      generates: {
        'out1/': {
          preset,
          config: {
            nullability: {
              errorHandlingClient: false,
            },
          },
        },
      },
    });

    const graphqlFile = result.find(f => f.filename === 'out1/graphql.ts');
    const formattedContent = prettier.format(graphqlFile.content, { parser: 'typescript' });

    expect(formattedContent).toBeSimilarStringTo(`
      export type TestQuery = {
        __typename?: "Query";
        me?: {
          __typename?: "User";
          field?: string | null;
          fieldLevel0?: string | null;
          fieldLevel1?: string | null;
          fieldBothLevels?: string | null;
          list?: Array<string | null> | null;
          listLevel0?: Array<string | null> | null;
          listLevel1?: Array<string | null> | null;
          listBothLevels?: Array<string | null> | null;
          nonNullableList: Array<string | null>;
          nonNullableListLevel0: Array<string | null>;
          nonNullableListLevel1: Array<string | null>;
          nonNullableListBothLevels: Array<string | null>;
          listWithNonNullableItem?: Array<string> | null;
          listWithNonNullableItemLevel0?: Array<string> | null;
          listWithNonNullableItemLevel1?: Array<string> | null;
          listWithNonNullableItemBothLevels?: Array<string> | null;
          nonNullableListWithNonNullableItem: Array<string>;
          nonNullableListWithNonNullableItemLevel0: Array<string>;
          nonNullableListWithNonNullableItemLevel1: Array<string>;
          nonNullableListWithNonNullableItemBothLevels: Array<string>;
        } | null;
      };
    `);
  });
});
