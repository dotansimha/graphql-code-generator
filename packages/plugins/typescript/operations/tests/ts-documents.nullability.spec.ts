import { buildSchema, parse } from 'graphql';
import * as prettier from 'prettier';
import { plugin } from '../src/index.js';

const schema = buildSchema(/* GraphQL */ `
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
`);

const document = parse(/* GraphQL */ `
  query {
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
`);

describe('TypeScript Operations Plugin - nullability', () => {
  it('converts semanticNonNull to nonNull when nullability.errorHandlingClient=true', async () => {
    const result = await plugin(schema, [{ document }], {
      nullability: {
        errorHandlingClient: true,
      },
    });

    const formattedContent = prettier.format(result.content, { parser: 'typescript' });
    expect(formattedContent).toMatchInlineSnapshot(`
      "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never }>;

      export type Unnamed_1_Query = {
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
      "
    `);
  });

  it('does not convert nullability to nonNull when nullability.errorHandlingClient=false', async () => {
    const result = await plugin(schema, [{ document }], {
      nullability: {
        errorHandlingClient: false,
      },
    });

    const formattedContent = prettier.format(result.content, { parser: 'typescript' });
    expect(formattedContent).toMatchInlineSnapshot(`
      "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never }>;

      export type Unnamed_1_Query = {
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
      "
    `);
  });
});
