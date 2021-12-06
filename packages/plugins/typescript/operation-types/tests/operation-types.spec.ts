import { plugin } from '../src';
import { buildSchema, parse } from 'graphql';
import '@graphql-codegen/testing';

const scalars = `/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};
`;

describe('typescript-operation-types', () => {
  const schema = buildSchema(/* GraphQL */ `
    enum IncludedEnum {
      first
      second
    }

    enum ModelEnum {
      model
      car
    }

    enum ExcludedEnum {
      excluded
      other
    }

    enum ExcludedModelEnum {
      included
      nope
    }

    input UsedInput {
      id: ID!
    }

    input UnusedInput {
      id: ID!
    }

    input NestedInput {
      id: ID!
      nested: UsedInput
    }

    input UsedEnumInput {
      input: IncludedEnum
    }

    input NestedEnumInput {
      input: UsedEnumInput
    }

    type IncludedType {
      id: String!
      name: String!
      included: Boolean!
    }

    type ExcludedType {
      id: String!
      name: String!
      excluded: Boolean!
    }

    type NestedType {
      id: String!
      nested: IncludedType!
    }

    type NestedTypeWithArgs {
      id: String!
      nested(id: ID!, nested: NestedInput!): IncludedType!
    }

    type ObjectWithEnum {
      id: ID!
      model: ModelEnum
    }

    type ExcludedObjectEnum {
      excluded: ExcludedModelEnum
    }

    interface TestInterface {
      id: ID!
      isInterface: Boolean!
    }

    type ExtendedType implements TestInterface {
      id: ID!
      isInterface: Boolean!
      name: String!
    }

    union ResultType = IncludedType | ObjectWithEnum

    type NestedUnionType {
      unionResult: ResultType
    }

    type Query {
      foo: IncludedType!
      dummyNestedType: NestedType!
      search(search: UsedInput): IncludedType!
      nested(search: NestedInput): NestedType!
      nestedArgs(search: NestedInput): NestedTypeWithArgs!
      arrayInput(search: [UsedInput!]!): IncludedType!
      nonNullInput(search: UsedInput!): IncludedType
      enumInput(input: UsedEnumInput): IncludedType
      nestedEnumInput(input: NestedEnumInput): IncludedType
      enumObject: ObjectWithEnum
      interfacedType: ExtendedType
      unionSearch: ResultType
      nestedUnion: NestedUnionType
    }
  `);

  it('should generate only the used model', async () => {
    const ast = parse(/* GraphQL */ `
      fragment UsedTypeFragment on IncludedType {
        id
        name
      }

      query testQuery {
        foo {
          ...UsedTypeFragment
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {
        scalars: {},
      }
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export type IncludedType = {
        __typename?: 'IncludedType';
        id: Scalars['String'];
        name: Scalars['String'];
        included: Scalars['Boolean'];
      };
      "
    `);
  });

  it('should generate all used nested models', async () => {
    const ast = parse(/* GraphQL */ `
      fragment UsedTypeFragment on NestedType {
        id
        nested {
          id
          included
          name
        }
      }

      query testQuery {
        dummyNestedType {
          ...UsedTypeFragment
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {}
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export type IncludedType = {
        __typename?: 'IncludedType';
        id: Scalars['String'];
        name: Scalars['String'];
        included: Scalars['Boolean'];
      };

      export type NestedType = {
        __typename?: 'NestedType';
        id: Scalars['String'];
        nested: IncludedType;
      };
      "
    `);
  });

  it('should include model enum types', async () => {
    const ast = parse(/* GraphQL */ `
      fragment UsedTypeFragment on ObjectWithEnum {
        model
      }

      query testQuery {
        enumObject {
          ...UsedTypeFragment
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {}
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export enum ModelEnum {
        Model = 'model',
        Car = 'car'
      }

      export type ObjectWithEnum = {
        __typename?: 'ObjectWithEnum';
        id: Scalars['ID'];
        model?: Maybe<ModelEnum>;
      };
      "
    `);
  });

  it('should should include input types', async () => {
    const ast = parse(/* GraphQL */ `
      fragment UsedTypeFragment on IncludedType {
        model
      }

      query testQuery($input: UsedInput) {
        search(input: $input) {
          ...UsedTypeFragment
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {}
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export type UsedInput = {
        id: Scalars['ID'];
      };

      export type IncludedType = {
        __typename?: 'IncludedType';
        id: Scalars['String'];
        name: Scalars['String'];
        included: Scalars['Boolean'];
      };
      "
    `);
  });

  it('should include nested input types', async () => {
    const ast = parse(/* GraphQL */ `
      fragment UsedTypeFragment on NestedType {
        id
        nested {
          id
          included
          name
        }
      }

      query testQuery($input: NestedInput) {
        nested(input: $input) {
          ...UsedTypeFragment
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {}
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export type UsedInput = {
        id: Scalars['ID'];
      };

      export type NestedInput = {
        id: Scalars['ID'];
        nested?: InputMaybe<UsedInput>;
      };

      export type IncludedType = {
        __typename?: 'IncludedType';
        id: Scalars['String'];
        name: Scalars['String'];
        included: Scalars['Boolean'];
      };

      export type NestedType = {
        __typename?: 'NestedType';
        id: Scalars['String'];
        nested: IncludedType;
      };
      "
    `);
  });

  it('should include input enums', async () => {
    const ast = parse(/* GraphQL */ `
      fragment UsedTypeFragment on IncludedType {
        id
        included
        name
      }

      query testQuery($input: UsedEnumInput) {
        enumInput(input: $input) {
          ...UsedTypeFragment
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {}
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export enum IncludedEnum {
        First = 'first',
        Second = 'second'
      }

      export type UsedEnumInput = {
        input?: InputMaybe<IncludedEnum>;
      };

      export type IncludedType = {
        __typename?: 'IncludedType';
        id: Scalars['String'];
        name: Scalars['String'];
        included: Scalars['Boolean'];
      };
      "
    `);
  });

  it('should included nested input enums', async () => {
    const ast = parse(/* GraphQL */ `
      fragment UsedTypeFragment on IncludedType {
        id
        included
        name
      }

      query testQuery($input: NestedEnumInput) {
        nestedEnumInput(input: $input) {
          ...UsedTypeFragment
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {}
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export enum IncludedEnum {
        First = 'first',
        Second = 'second'
      }

      export type UsedEnumInput = {
        input?: InputMaybe<IncludedEnum>;
      };

      export type NestedEnumInput = {
        input?: InputMaybe<UsedEnumInput>;
      };

      export type IncludedType = {
        __typename?: 'IncludedType';
        id: Scalars['String'];
        name: Scalars['String'];
        included: Scalars['Boolean'];
      };
      "
    `);
  });

  it('should include used model interfaces', async () => {
    const ast = parse(/* GraphQL */ `
      fragment UsedTypeFragment on ExtendedType {
        id
        isInterface
        name
      }

      query testQuery {
        interfacedType {
          ...UsedTypeFragment
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {}
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export type TestInterface = {
        id: Scalars['ID'];
        isInterface: Scalars['Boolean'];
      };

      export type ExtendedType = TestInterface & {
        __typename?: 'ExtendedType';
        id: Scalars['ID'];
        isInterface: Scalars['Boolean'];
        name: Scalars['String'];
      };
      "
    `);
  });

  it('should include inline fragment models', async () => {
    const ast = parse(/* GraphQL */ `
      query testQuery {
        foo {
          id
          included
          name
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {}
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export type IncludedType = {
        __typename?: 'IncludedType';
        id: Scalars['String'];
        name: Scalars['String'];
        included: Scalars['Boolean'];
      };
      "
    `);
  });

  it('should include inline fragment unions', async () => {
    const ast = parse(/* GraphQL */ `
      query testQuery {
        unionSearch {
          __typename
          ... on IncludedType {
            id
            included
            name
          }
          ... on ObjectWithEnum {
            id
            model
          }
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {}
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export enum ModelEnum {
        Model = 'model',
        Car = 'car'
      }

      export type IncludedType = {
        __typename?: 'IncludedType';
        id: Scalars['String'];
        name: Scalars['String'];
        included: Scalars['Boolean'];
      };

      export type ObjectWithEnum = {
        __typename?: 'ObjectWithEnum';
        id: Scalars['ID'];
        model?: Maybe<ModelEnum>;
      };
      "
    `);
  });

  it('should handle nested unions', async () => {
    const ast = parse(/* GraphQL */ `
      query testQuery {
        nestedUnion {
          unionResult {
            __typename
            ... on IncludedType {
              id
              included
              name
            }
            ... on ObjectWithEnum {
              id
              model
            }
          }
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {}
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export enum ModelEnum {
        Model = 'model',
        Car = 'car'
      }

      export type IncludedType = {
        __typename?: 'IncludedType';
        id: Scalars['String'];
        name: Scalars['String'];
        included: Scalars['Boolean'];
      };

      export type ObjectWithEnum = {
        __typename?: 'ObjectWithEnum';
        id: Scalars['ID'];
        model?: Maybe<ModelEnum>;
      };

      export type ResultType = IncludedType | ObjectWithEnum;

      export type NestedUnionType = {
        __typename?: 'NestedUnionType';
        unionResult?: Maybe<ResultType>;
      };
      "
    `);
  });

  it('should not include the args type', async () => {
    const ast = parse(/* GraphQL */ `
      fragment NestedArgsFragment on NestedTypeWithArgs {
        id
        nested {
          id
          name
        }
      }

      query testQuery {
        nestedArgs {
          ...NestedArgsFragment
        }
      }
    `);

    const result = await plugin(
      schema,
      [
        {
          document: ast,
        },
      ],
      {}
    );

    expect(result.content).toMatchInlineSnapshot(`
      "/** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export type IncludedType = {
        __typename?: 'IncludedType';
        id: Scalars['String'];
        name: Scalars['String'];
        included: Scalars['Boolean'];
      };

      export type NestedTypeWithArgs = {
        __typename?: 'NestedTypeWithArgs';
        id: Scalars['String'];
        nested: IncludedType;
      };
      "
    `);
  });

  describe('when omitObjectTypes is true', () => {
    it('should include the fragment enums', async () => {
      const ast = parse(/* GraphQL */ `
        fragment UsedTypeFragment on ObjectWithEnum {
          id
          model
        }

        query testQuery {
          enumObject {
            ...UsedTypeFragment
          }
        }
      `);

      const result = await plugin(
        schema,
        [
          {
            document: ast,
          },
        ],
        {
          omitObjectTypes: true,
        }
      );

      expect(result.content).toEqual(`${scalars}
export enum ModelEnum {
  Model = 'model',
  Car = 'car'
}
`);
    });

    it('should not include the model enum if the fragment does not reference it', async () => {
      const ast = parse(/* GraphQL */ `
        fragment UsedTypeFragment on ObjectWithEnum {
          id
        }

        query testQuery {
          enumObject {
            ...UsedTypeFragment
          }
        }
      `);

      const result = await plugin(
        schema,
        [
          {
            document: ast,
          },
        ],
        {
          omitObjectTypes: true,
        }
      );

      expect(result.content).toEqual(scalars);
    });

    it('should not emit the model', async () => {
      const ast = parse(/* GraphQL */ `
        fragment UsedTypeFragment on IncludedType {
          id
          name
        }

        query testQuery {
          foo {
            ...UsedTypeFragment
          }
        }
      `);

      const result = await plugin(
        schema,
        [
          {
            document: ast,
          },
        ],
        {
          omitObjectTypes: true,
        }
      );

      expect(result.content).toEqual(scalars);
    });

    it('should not emit the nested models', async () => {
      const ast = parse(/* GraphQL */ `
        fragment UsedTypeFragment on NestedType {
          id
          nested {
            id
            included
            name
          }
        }

        query testQuery {
          dummyNestedType {
            ...UsedTypeFragment
          }
        }
      `);

      const result = await plugin(
        schema,
        [
          {
            document: ast,
          },
        ],
        {
          omitObjectTypes: true,
        }
      );

      expect(result.content).toEqual(scalars);
    });
  });
});
