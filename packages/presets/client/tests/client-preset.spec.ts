import { executeCodegen } from '@graphql-codegen/cli';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { print } from 'graphql';
import path from 'path';
import { addTypenameSelectionDocumentTransform, preset } from '../src/index.js';

describe('client-preset', () => {
  it('can generate simple examples uppercase names', async () => {
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            a: String
            b: String
            c: String
          }
        `,
      ],
      documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
      generates: {
        'out1/': {
          preset,
        },
      },
    });

    expect(result).toHaveLength(4);
    // index.ts (re-exports)
    const indexFile = result.find(file => file.filename === 'out1/index.ts');
    expect(indexFile.content).toEqual(`export * from "./fragment-masking";
export * from "./gql";`);

    // gql.ts
    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as types from './graphql';
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      /**
       * Map of all GraphQL operations in the project.
       *
       * This map has several performance disadvantages:
       * 1. It is not tree-shakeable, so it will include all operations in the project.
       * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
       * 3. It does not support dead code elimination, so it will add unused operations.
       *
       * Therefore it is highly recommended to use the babel or swc plugin for production.
       * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
       */
      type Documents = {
          "\\n  query A {\\n    a\\n  }\\n": typeof types.ADocument,
          "\\n  query B {\\n    b\\n  }\\n": typeof types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": typeof types.CFragmentDoc,
      };
      const documents: Documents = {
          "\\n  query A {\\n    a\\n  }\\n": types.ADocument,
          "\\n  query B {\\n    b\\n  }\\n": types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
      };

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       *
       *
       * @example
       * \`\`\`ts
       * const query = graphql(\`query GetUser($id: ID!) { user(id: $id) { name } }\`);
       * \`\`\`
       *
       * The query argument is unknown!
       * Please regenerate the types.
       */
      export function graphql(source: string): unknown;

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query A {\\n    a\\n  }\\n"): (typeof documents)["\\n  query A {\\n    a\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query B {\\n    b\\n  }\\n"): (typeof documents)["\\n  query B {\\n    b\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

      export function graphql(source: string) {
        return (documents as any)[source] ?? {};
      }

      export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
    `);

    // graphql.ts
    const graphqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(graphqlFile).toBeDefined();
  });

  it('can generate simple examples lowercase names', async () => {
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            a: String
            b: String
            c: String
          }
        `,
      ],
      documents: path.join(__dirname, 'fixtures/simple-lowercase-operation-name.ts'),
      generates: {
        'out1/': {
          preset,
        },
      },
    });

    expect(result).toHaveLength(4);
    // index.ts (re-exports)
    const indexFile = result.find(file => file.filename === 'out1/index.ts');
    expect(indexFile.content).toEqual(`export * from "./fragment-masking";
export * from "./gql";`);

    // gql.ts
    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as types from './graphql';
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      /**
       * Map of all GraphQL operations in the project.
       *
       * This map has several performance disadvantages:
       * 1. It is not tree-shakeable, so it will include all operations in the project.
       * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
       * 3. It does not support dead code elimination, so it will add unused operations.
       *
       * Therefore it is highly recommended to use the babel or swc plugin for production.
       * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
       */
      type Documents = {
          "\\n  query a {\\n    a\\n  }\\n": typeof types.ADocument,
          "\\n  query b {\\n    b\\n  }\\n": typeof types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": typeof types.CFragmentDoc,
      };
      const documents: Documents = {
          "\\n  query a {\\n    a\\n  }\\n": types.ADocument,
          "\\n  query b {\\n    b\\n  }\\n": types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
      };

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       *
       *
       * @example
       * \`\`\`ts
       * const query = graphql(\`query GetUser($id: ID!) { user(id: $id) { name } }\`);
       * \`\`\`
       *
       * The query argument is unknown!
       * Please regenerate the types.
       */
      export function graphql(source: string): unknown;

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query a {\\n    a\\n  }\\n"): (typeof documents)["\\n  query a {\\n    a\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query b {\\n    b\\n  }\\n"): (typeof documents)["\\n  query b {\\n    b\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

      export function graphql(source: string) {
        return (documents as any)[source] ?? {};
      }

      export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
    `);

    // graphql.ts
    const graphqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(graphqlFile).toBeDefined();
  });

  it('generates \\n regardless of whether the source contains LF or CRLF', async () => {
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            a: String
            b: String
            c: String
          }
        `,
      ],
      documents: path.join(__dirname, 'fixtures/crlf-operation.ts'),
      generates: {
        'out1/': {
          preset,
        },
      },
    });
    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as types from './graphql';
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      /**
       * Map of all GraphQL operations in the project.
       *
       * This map has several performance disadvantages:
       * 1. It is not tree-shakeable, so it will include all operations in the project.
       * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
       * 3. It does not support dead code elimination, so it will add unused operations.
       *
       * Therefore it is highly recommended to use the babel or swc plugin for production.
       * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
       */
      type Documents = {
          "\\n  query a {\\n    a\\n  }\\n": typeof types.ADocument,
          "\\n  query b {\\n    b\\n  }\\n": typeof types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": typeof types.CFragmentDoc,
      };
      const documents: Documents = {
          "\\n  query a {\\n    a\\n  }\\n": types.ADocument,
          "\\n  query b {\\n    b\\n  }\\n": types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
      };

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       *
       *
       * @example
       * \`\`\`ts
       * const query = graphql(\`query GetUser($id: ID!) { user(id: $id) { name } }\`);
       * \`\`\`
       *
       * The query argument is unknown!
       * Please regenerate the types.
       */
      export function graphql(source: string): unknown;

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query a {\\n    a\\n  }\\n"): (typeof documents)["\\n  query a {\\n    a\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query b {\\n    b\\n  }\\n"): (typeof documents)["\\n  query b {\\n    b\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

      export function graphql(source: string) {
        return (documents as any)[source] ?? {};
      }

      export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
    `);
  });

  it("follows 'useTypeImports': true", async () => {
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            a: String
            b: String
            c: String
          }
        `,
      ],
      documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
      generates: {
        'out1/': {
          preset,
        },
      },
      config: {
        useTypeImports: true,
      },
    });

    expect(result.length).toBe(4);
    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as types from './graphql';
      import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      /**
       * Map of all GraphQL operations in the project.
       *
       * This map has several performance disadvantages:
       * 1. It is not tree-shakeable, so it will include all operations in the project.
       * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
       * 3. It does not support dead code elimination, so it will add unused operations.
       *
       * Therefore it is highly recommended to use the babel or swc plugin for production.
       * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
       */
      type Documents = {
          "\\n  query A {\\n    a\\n  }\\n": typeof types.ADocument,
          "\\n  query B {\\n    b\\n  }\\n": typeof types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": typeof types.CFragmentDoc,
      };
      const documents: Documents = {
          "\\n  query A {\\n    a\\n  }\\n": types.ADocument,
          "\\n  query B {\\n    b\\n  }\\n": types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
      };

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       *
       *
       * @example
       * \`\`\`ts
       * const query = graphql(\`query GetUser($id: ID!) { user(id: $id) { name } }\`);
       * \`\`\`
       *
       * The query argument is unknown!
       * Please regenerate the types.
       */
      export function graphql(source: string): unknown;

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query A {\\n    a\\n  }\\n"): (typeof documents)["\\n  query A {\\n    a\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query B {\\n    b\\n  }\\n"): (typeof documents)["\\n  query B {\\n    b\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

      export function graphql(source: string) {
        return (documents as any)[source] ?? {};
      }

      export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
    `);
    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
      export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: { input: string; output: string; }
        String: { input: string; output: string; }
        Boolean: { input: boolean; output: boolean; }
        Int: { input: number; output: number; }
        Float: { input: number; output: number; }
      };

      export type Query = {
        __typename?: 'Query';
        a?: Maybe<Scalars['String']['output']>;
        b?: Maybe<Scalars['String']['output']>;
        c?: Maybe<Scalars['String']['output']>;
      };

      export type AQueryVariables = Exact<{ [key: string]: never; }>;


      export type AQuery = { __typename?: 'Query', a?: string | null };

      export type BQueryVariables = Exact<{ [key: string]: never; }>;


      export type BQuery = { __typename?: 'Query', b?: string | null };

      export type CFragment = { __typename?: 'Query', c?: string | null } & { ' $fragmentName'?: 'CFragment' };

      export const CFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"C"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"c"}}]}}]} as unknown as DocumentNode<CFragment, unknown>;
      export const ADocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"A"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;
      export const BDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"B"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<BQuery, BQueryVariables>;"
    `);

    expect(graphqlFile.content).toContain(
      "import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'"
    );
    expect(gqlFile.content).toContain(
      "import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'"
    );
  });

  it("follows 'nonOptionalTypename': true", async () => {
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            a: String
            b: String
            c: String
          }
        `,
      ],
      documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
      generates: {
        'out1/': {
          preset,
        },
      },
      config: {
        nonOptionalTypename: true,
      },
    });

    expect(result.length).toBe(4);
    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as types from './graphql';
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      /**
       * Map of all GraphQL operations in the project.
       *
       * This map has several performance disadvantages:
       * 1. It is not tree-shakeable, so it will include all operations in the project.
       * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
       * 3. It does not support dead code elimination, so it will add unused operations.
       *
       * Therefore it is highly recommended to use the babel or swc plugin for production.
       * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
       */
      type Documents = {
          "\\n  query A {\\n    a\\n  }\\n": typeof types.ADocument,
          "\\n  query B {\\n    b\\n  }\\n": typeof types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": typeof types.CFragmentDoc,
      };
      const documents: Documents = {
          "\\n  query A {\\n    a\\n  }\\n": types.ADocument,
          "\\n  query B {\\n    b\\n  }\\n": types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
      };

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       *
       *
       * @example
       * \`\`\`ts
       * const query = graphql(\`query GetUser($id: ID!) { user(id: $id) { name } }\`);
       * \`\`\`
       *
       * The query argument is unknown!
       * Please regenerate the types.
       */
      export function graphql(source: string): unknown;

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query A {\\n    a\\n  }\\n"): (typeof documents)["\\n  query A {\\n    a\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query B {\\n    b\\n  }\\n"): (typeof documents)["\\n  query B {\\n    b\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

      export function graphql(source: string) {
        return (documents as any)[source] ?? {};
      }

      export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
    `);
    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
      export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: { input: string; output: string; }
        String: { input: string; output: string; }
        Boolean: { input: boolean; output: boolean; }
        Int: { input: number; output: number; }
        Float: { input: number; output: number; }
      };

      export type Query = {
        __typename: 'Query';
        a?: Maybe<Scalars['String']['output']>;
        b?: Maybe<Scalars['String']['output']>;
        c?: Maybe<Scalars['String']['output']>;
      };

      export type AQueryVariables = Exact<{ [key: string]: never; }>;


      export type AQuery = { __typename: 'Query', a?: string | null };

      export type BQueryVariables = Exact<{ [key: string]: never; }>;


      export type BQuery = { __typename: 'Query', b?: string | null };

      export type CFragment = { __typename: 'Query', c?: string | null } & { ' $fragmentName'?: 'CFragment' };

      export const CFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"C"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"c"}}]}}]} as unknown as DocumentNode<CFragment, unknown>;
      export const ADocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"A"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;
      export const BDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"B"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<BQuery, BQueryVariables>;"
    `);

    expect(graphqlFile.content).toContain("__typename: 'Query';");
  });

  it('supports Apollo fragment masking', async () => {
    const result = await executeCodegen({
      schema: /* GraphQL */ `
        type Query {
          me: User
        }

        type User {
          id: ID!
          name: String!
          age: Int!
        }
      `,
      documents: /* GraphQL */ `
        query Me {
          unmasked: me {
            id
            ...User_Me @unmask
          }
          masked: me {
            id
            ...User_Me
          }
        }

        fragment User_Me on User {
          name
          age
        }
      `,
      generates: {
        'out1/': {
          preset,
          presetConfig: { fragmentMasking: false },
          config: {
            inlineFragmentTypes: 'mask',
            customDirectives: { apolloUnmask: true },
          },
        },
      },
    });

    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
      export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: { input: string; output: string; }
        String: { input: string; output: string; }
        Boolean: { input: boolean; output: boolean; }
        Int: { input: number; output: number; }
        Float: { input: number; output: number; }
      };

      export type Query = {
        __typename?: 'Query';
        me?: Maybe<User>;
      };

      export type User = {
        __typename?: 'User';
        age: Scalars['Int']['output'];
        id: Scalars['ID']['output'];
        name: Scalars['String']['output'];
      };

      export type MeQueryVariables = Exact<{ [key: string]: never; }>;


      export type MeQuery = { __typename?: 'Query', unmasked?: { __typename?: 'User', id: string, name: string, age: number } | null, masked?: (
          { __typename?: 'User', id: string }
          & { ' $fragmentRefs'?: { 'User_MeFragment': User_MeFragment } }
        ) | null };

      export type User_MeFragment = { __typename?: 'User', name: string, age: number } & { ' $fragmentName'?: 'User_MeFragment' };

      export const User_MeFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User_Me"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"age"}}]}}]} as unknown as DocumentNode<User_MeFragment, unknown>;
      export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"unmasked"},"name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"User_Me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"unmask"}}]}]}},{"kind":"Field","alias":{"kind":"Name","value":"masked"},"name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"User_Me"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User_Me"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"age"}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;"
    `);
  });

  it('prevent duplicate operations', async () => {
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            a: String
          }
        `,
      ],
      documents: path.join(__dirname, 'fixtures/duplicate-operation.ts'),
      generates: {
        'out1/': {
          preset,
        },
      },
      config: {
        useTypeImports: true,
      },
    });

    expect(result.length).toBe(4);
    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as types from './graphql';
      import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      /**
       * Map of all GraphQL operations in the project.
       *
       * This map has several performance disadvantages:
       * 1. It is not tree-shakeable, so it will include all operations in the project.
       * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
       * 3. It does not support dead code elimination, so it will add unused operations.
       *
       * Therefore it is highly recommended to use the babel or swc plugin for production.
       * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
       */
      type Documents = {
          "\\n  query a {\\n    a\\n  }\\n": typeof types.ADocument,
      };
      const documents: Documents = {
          "\\n  query a {\\n    a\\n  }\\n": types.ADocument,
      };

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       *
       *
       * @example
       * \`\`\`ts
       * const query = graphql(\`query GetUser($id: ID!) { user(id: $id) { name } }\`);
       * \`\`\`
       *
       * The query argument is unknown!
       * Please regenerate the types.
       */
      export function graphql(source: string): unknown;

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query a {\\n    a\\n  }\\n"): (typeof documents)["\\n  query a {\\n    a\\n  }\\n"];

      export function graphql(source: string) {
        return (documents as any)[source] ?? {};
      }

      export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
    `);
    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
      export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: { input: string; output: string; }
        String: { input: string; output: string; }
        Boolean: { input: boolean; output: boolean; }
        Int: { input: number; output: number; }
        Float: { input: number; output: number; }
      };

      export type Query = {
        __typename?: 'Query';
        a?: Maybe<Scalars['String']['output']>;
      };

      export type AQueryVariables = Exact<{ [key: string]: never; }>;


      export type AQuery = { __typename?: 'Query', a?: string | null };


      export const ADocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"a"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;"
    `);

    expect(gqlFile.content.match(/query a {/g).length).toBe(4);
  });

  describe('fragment masking', () => {
    it('fragmentMasking: false', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              fragmentMasking: false,
            },
          },
        },
      });

      expect(result).toHaveLength(3);
      const fileNames = result.map(res => res.filename);
      expect(fileNames).toContain('out1/index.ts');
      expect(fileNames).toContain('out1/gql.ts');
      expect(fileNames).toContain('out1/graphql.ts');

      const indexFile = result.find(file => file.filename === 'out1/index.ts');
      expect(indexFile.content).toMatchInlineSnapshot(`"export * from "./gql";"`);
      const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
      expect(gqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import * as types from './graphql';
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

        /**
         * Map of all GraphQL operations in the project.
         *
         * This map has several performance disadvantages:
         * 1. It is not tree-shakeable, so it will include all operations in the project.
         * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
         * 3. It does not support dead code elimination, so it will add unused operations.
         *
         * Therefore it is highly recommended to use the babel or swc plugin for production.
         * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
         */
        type Documents = {
            "\\n  query A {\\n    a\\n  }\\n": typeof types.ADocument,
            "\\n  query B {\\n    b\\n  }\\n": typeof types.BDocument,
            "\\n  fragment C on Query {\\n    c\\n  }\\n": typeof types.CFragmentDoc,
        };
        const documents: Documents = {
            "\\n  query A {\\n    a\\n  }\\n": types.ADocument,
            "\\n  query B {\\n    b\\n  }\\n": types.BDocument,
            "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
        };

        /**
         * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
         *
         *
         * @example
         * \`\`\`ts
         * const query = graphql(\`query GetUser($id: ID!) { user(id: $id) { name } }\`);
         * \`\`\`
         *
         * The query argument is unknown!
         * Please regenerate the types.
         */
        export function graphql(source: string): unknown;

        /**
         * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
         */
        export function graphql(source: "\\n  query A {\\n    a\\n  }\\n"): (typeof documents)["\\n  query A {\\n    a\\n  }\\n"];
        /**
         * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
         */
        export function graphql(source: "\\n  query B {\\n    b\\n  }\\n"): (typeof documents)["\\n  query B {\\n    b\\n  }\\n"];
        /**
         * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
         */
        export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

        export function graphql(source: string) {
          return (documents as any)[source] ?? {};
        }

        export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
      `);
    });

    it('fragmentMasking: {}', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              fragmentMasking: {},
            },
          },
        },
      });

      expect(result).toHaveLength(4);
    });

    it('fragmentMasking.unmaskFunctionName', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              fragmentMasking: {
                unmaskFunctionName: 'iLikeTurtles',
              },
            },
          },
        },
      });

      expect(result).toHaveLength(4);
      const gqlFile = result.find(file => file.filename === 'out1/fragment-masking.ts');
      expect(gqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { ResultOf, DocumentTypeDecoration, TypedDocumentNode } from '@graphql-typed-document-node/core';
        import { FragmentDefinitionNode } from 'graphql';
        import { Incremental } from './graphql';


        export type FragmentType<TDocumentType extends DocumentTypeDecoration<any, any>> = TDocumentType extends DocumentTypeDecoration<
          infer TType,
          any
        >
          ? [TType] extends [{ ' $fragmentName'?: infer TKey }]
            ? TKey extends string
              ? { ' $fragmentRefs'?: { [key in TKey]: TType } }
              : never
            : never
          : never;

        // return non-nullable if \`fragmentType\` is non-nullable
        export function iLikeTurtles<TType>(
          _documentNode: DocumentTypeDecoration<TType, any>,
          fragmentType: FragmentType<DocumentTypeDecoration<TType, any>>
        ): TType;
        // return nullable if \`fragmentType\` is undefined
        export function iLikeTurtles<TType>(
          _documentNode: DocumentTypeDecoration<TType, any>,
          fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | undefined
        ): TType | undefined;
        // return nullable if \`fragmentType\` is nullable
        export function iLikeTurtles<TType>(
          _documentNode: DocumentTypeDecoration<TType, any>,
          fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null
        ): TType | null;
        // return nullable if \`fragmentType\` is nullable or undefined
        export function iLikeTurtles<TType>(
          _documentNode: DocumentTypeDecoration<TType, any>,
          fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null | undefined
        ): TType | null | undefined;
        // return array of non-nullable if \`fragmentType\` is array of non-nullable
        export function iLikeTurtles<TType>(
          _documentNode: DocumentTypeDecoration<TType, any>,
          fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>>
        ): Array<TType>;
        // return array of nullable if \`fragmentType\` is array of nullable
        export function iLikeTurtles<TType>(
          _documentNode: DocumentTypeDecoration<TType, any>,
          fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
        ): Array<TType> | null | undefined;
        // return readonly array of non-nullable if \`fragmentType\` is array of non-nullable
        export function iLikeTurtles<TType>(
          _documentNode: DocumentTypeDecoration<TType, any>,
          fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>>
        ): ReadonlyArray<TType>;
        // return readonly array of nullable if \`fragmentType\` is array of nullable
        export function iLikeTurtles<TType>(
          _documentNode: DocumentTypeDecoration<TType, any>,
          fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
        ): ReadonlyArray<TType> | null | undefined;
        export function iLikeTurtles<TType>(
          _documentNode: DocumentTypeDecoration<TType, any>,
          fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | Array<FragmentType<DocumentTypeDecoration<TType, any>>> | ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
        ): TType | Array<TType> | ReadonlyArray<TType> | null | undefined {
          return fragmentType as any;
        }


        export function makeFragmentData<
          F extends DocumentTypeDecoration<any, any>,
          FT extends ResultOf<F>
        >(data: FT, _fragment: F): FragmentType<F> {
          return data as FragmentType<F>;
        }
        export function isFragmentReady<TQuery, TFrag>(
          queryNode: DocumentTypeDecoration<TQuery, any>,
          fragmentNode: TypedDocumentNode<TFrag>,
          data: FragmentType<TypedDocumentNode<Incremental<TFrag>, any>> | null | undefined
        ): data is FragmentType<typeof fragmentNode> {
          const deferredFields = (queryNode as { __meta__?: { deferredFields: Record<string, (keyof TFrag)[]> } }).__meta__
            ?.deferredFields;

          if (!deferredFields) return true;

          const fragDef = fragmentNode.definitions[0] as FragmentDefinitionNode | undefined;
          const fragName = fragDef?.name?.value;

          const fields = (fragName && deferredFields[fragName]) || [];
          return fields.length > 0 && fields.every(field => data && field in data);
        }
        "
      `);
    });

    it('can accept null in useFragment', async () => {
      const docPath = path.join(__dirname, 'fixtures/with-fragment.ts');
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              foo: Foo
              foos: [Foo]
            }

            type Foo {
              value: String
            }
          `,
        ],
        documents: docPath,
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              fragmentMasking: true,
            },
          },
        },
      });

      const content = mergeOutputs([
        ...result,
        fs.readFileSync(docPath, 'utf8'),
        `
        function App(props: { data: FooQuery }) {
          const fragment: FooFragment | null | undefined = useFragment(Fragment, props.data.foo);
          return fragment == null ? "no data" : fragment.value;
        }
        `,
      ]);
      validateTs(content, undefined, false, true, [`Duplicate identifier 'DocumentNode'.`], true);
    });

    it('can accept list in useFragment', async () => {
      const docPath = path.join(__dirname, 'fixtures/with-fragment.ts');
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              foo: Foo
              foos: [Foo!]
            }

            type Foo {
              value: String
            }
          `,
        ],
        documents: docPath,
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              fragmentMasking: true,
            },
          },
        },
      });

      const content = mergeOutputs([
        ...result,
        fs.readFileSync(docPath, 'utf8'),
        `
        function App(props: { foos: Array<FragmentType<typeof Fragment>> }) {
          const fragments: Array<FooFragment> = useFragment(Fragment, props.foos);
          return fragments.map(f => f.value);
        }
        `,
      ]);

      validateTs(content, undefined, false, true, [`Duplicate identifier 'DocumentNode'.`], true);
    });

    it('useFragment preserves ReadonlyArray<T> type', async () => {
      const docPath = path.join(__dirname, 'fixtures/with-fragment.ts');
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              foo: Foo
              foos: [Foo!]
            }

            type Foo {
              value: String
            }
          `,
        ],
        documents: docPath,
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              fragmentMasking: true,
            },
          },
        },
      });

      const content = mergeOutputs([
        ...result,
        fs.readFileSync(docPath, 'utf8'),
        `
        function App(props: { data: FoosQuery }) {
          const fragments: ReadonlyArray<FooFragment> | null | undefined = useFragment(Fragment, props.data.foos);
          return fragments == null ? "no data" : fragments.map(f => f.value);
        }
        `,
      ]);

      validateTs(content, undefined, false, true, [`Duplicate identifier 'DocumentNode'.`], true);
    });
  });

  it('generates correct named imports for ESM', async () => {
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            a: String
            b: String
            c: String
          }
        `,
      ],
      documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
      generates: {
        'out1/': {
          preset,
        },
      },
      emitLegacyCommonJSImports: false,
    });

    expect(result).toHaveLength(4);
    // index.ts (re-exports)
    const indexFile = result.find(file => file.filename === 'out1/index.ts');
    expect(indexFile.content).toEqual(`export * from "./fragment-masking.js";
export * from "./gql.js";`);

    // gql.ts
    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as types from './graphql.js';
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      /**
       * Map of all GraphQL operations in the project.
       *
       * This map has several performance disadvantages:
       * 1. It is not tree-shakeable, so it will include all operations in the project.
       * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
       * 3. It does not support dead code elimination, so it will add unused operations.
       *
       * Therefore it is highly recommended to use the babel or swc plugin for production.
       * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
       */
      type Documents = {
          "\\n  query A {\\n    a\\n  }\\n": typeof types.ADocument,
          "\\n  query B {\\n    b\\n  }\\n": typeof types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": typeof types.CFragmentDoc,
      };
      const documents: Documents = {
          "\\n  query A {\\n    a\\n  }\\n": types.ADocument,
          "\\n  query B {\\n    b\\n  }\\n": types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
      };

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       *
       *
       * @example
       * \`\`\`ts
       * const query = graphql(\`query GetUser($id: ID!) { user(id: $id) { name } }\`);
       * \`\`\`
       *
       * The query argument is unknown!
       * Please regenerate the types.
       */
      export function graphql(source: string): unknown;

      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query A {\\n    a\\n  }\\n"): (typeof documents)["\\n  query A {\\n    a\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  query B {\\n    b\\n  }\\n"): (typeof documents)["\\n  query B {\\n    b\\n  }\\n"];
      /**
       * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
       */
      export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

      export function graphql(source: string) {
        return (documents as any)[source] ?? {};
      }

      export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
    `);

    // graphql.ts
    const graphqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(graphqlFile).toBeDefined();
  });

  it('should dedupe fragments - #8670', async () => {
    const dir = path.join(__dirname, 'tmp/duplicate-fragments');
    const cleanUp = async () => {
      await fs.promises.rm(dir, { recursive: true, force: true });
    };

    const docPath = path.join(__dirname, 'fixtures/reused-fragment.ts');
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            user(id: ID!): User!
            event(id: ID!): Event!
          }

          type User {
            id: ID!
            username: String!
            email: String!
          }

          type Event {
            id: ID!
            owner: User!
            attendees: [User!]!
          }
        `,
      ],
      documents: [docPath],
      generates: {
        'out1/': {
          preset,
          plugins: [],
        },
      },
    });

    // TODO: Consider using in-memory file system for tests like this.
    try {
      await cleanUp();
    } catch {}
    await fs.promises.mkdir(path.join(dir, 'out1'), { recursive: true });
    for (const file of result) {
      if (file.filename === 'out1/graphql.ts') {
        await fs.promises.writeFile(path.join(dir, file.filename), file.content, 'utf-8');
      }
    }

    const { default: jiti } = await import('jiti');
    const loader = jiti('', {});

    const { EventQueryDocument } = loader(path.join(dir, 'out1/graphql.ts'));

    const printed = print(EventQueryDocument);

    expect(printed.match(/fragment SharedComponentFragment on User/g)?.length).toBe(1);

    await cleanUp();
  });

  it('should dedupe fragments in a "string" document mode', async () => {
    const dir = path.join(__dirname, 'tmp/duplicate-fragments');
    const cleanUp = async () => {
      await fs.promises.rm(dir, { recursive: true, force: true });
    };

    const docPath = path.join(__dirname, 'fixtures/reused-fragment.ts');
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            user(id: ID!): User!
            event(id: ID!): Event!
          }

          type User {
            id: ID!
            username: String!
            email: String!
          }

          type Event {
            id: ID!
            owner: User!
            attendees: [User!]!
          }
        `,
      ],
      documents: [docPath],
      generates: {
        'out1/': {
          preset,
          plugins: [],
          config: {
            documentMode: 'string',
          },
        },
      },
    });

    // TODO: Consider using in-memory file system for tests like this.
    try {
      await cleanUp();
    } catch {}
    await fs.promises.mkdir(path.join(dir, 'out1'), { recursive: true });
    for (const file of result) {
      if (file.filename === 'out1/graphql.ts') {
        await fs.promises.writeFile(path.join(dir, file.filename), file.content, 'utf-8');
      }
    }

    const { default: jiti } = await import('jiti');
    const loader = jiti('', {});

    const { EventQueryDocument } = loader(path.join(dir, 'out1/graphql.ts'));

    expect(EventQueryDocument.match(/fragment SharedComponentFragment on User/g)?.length).toBe(1);

    await cleanUp();
  });

  describe('when no operations are found', () => {
    it('still generates the helper `graphql()` (or under another `presetConfig.gqlTagName` name) function', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        generates: {
          'out1/': {
            preset,
          },
        },
        emitLegacyCommonJSImports: false,
      });

      expect(result).toHaveLength(4);
      // index.ts (re-exports)
      const indexFile = result.find(file => file.filename === 'out1/index.ts');
      expect(indexFile.content).toEqual(`export * from "./fragment-masking.js";
export * from "./gql.js";`);

      // gql.ts
      const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
      expect(gqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import * as types from './graphql.js';
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

        const documents = [];
        /**
         * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
         *
         *
         * @example
         * \`\`\`ts
         * const query = graphql(\`query GetUser($id: ID!) { user(id: $id) { name } }\`);
         * \`\`\`
         *
         * The query argument is unknown!
         * Please regenerate the types.
         */
        export function graphql(source: string): unknown;

        export function graphql(source: string) {
          return (documents as any)[source] ?? {};
        }

        export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
      `);
      // graphql.ts
      const graphqlFile = result.find(file => file.filename === 'out1/gql.ts');
      expect(graphqlFile).toBeDefined();
    });
  });

  it('embed metadata in executable document node', async () => {
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            a: String
            b: String
            c: String
          }
        `,
      ],
      documents: [
        /* GraphQL */ `
          query aaa {
            a
          }
        `,
        /* GraphQL */ `
          query bbb {
            b
          }
        `,
      ],
      generates: {
        'out1/': {
          preset,
          presetConfig: {
            onExecutableDocumentNode(node) {
              return {
                cacheKeys: [node.definitions[0].name.value],
              };
            },
          },
        },
      },
      emitLegacyCommonJSImports: false,
    });
    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
      export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: { input: string; output: string; }
        String: { input: string; output: string; }
        Boolean: { input: boolean; output: boolean; }
        Int: { input: number; output: number; }
        Float: { input: number; output: number; }
      };

      export type Query = {
        __typename?: 'Query';
        a?: Maybe<Scalars['String']['output']>;
        b?: Maybe<Scalars['String']['output']>;
        c?: Maybe<Scalars['String']['output']>;
      };

      export type BbbQueryVariables = Exact<{ [key: string]: never; }>;


      export type BbbQuery = { __typename?: 'Query', b?: string | null };

      export type AaaQueryVariables = Exact<{ [key: string]: never; }>;


      export type AaaQuery = { __typename?: 'Query', a?: string | null };


      export const BbbDocument = {"__meta__":{"cacheKeys":["bbb"]},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"bbb"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<BbbQuery, BbbQueryVariables>;
      export const AaaDocument = {"__meta__":{"cacheKeys":["aaa"]},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"aaa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AaaQuery, AaaQueryVariables>;"
    `);
  });

  describe('persisted operations', () => {
    it('apply default settings', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              persistedDocuments: true,
            },
          },
        },
        emitLegacyCommonJSImports: false,
      });

      expect(result).toHaveLength(5);

      const persistedDocuments = result.find(file => file.filename === 'out1/persisted-documents.json');

      expect(persistedDocuments.content).toMatchInlineSnapshot(`
        "{
          "b61b879c1eb0040bce65d70c8adfb1ae9360f52f": "query A { a }",
          "c3ea9f3f937d47d72c70055ea55c7cf88a35e608": "query B { b }"
        }"
      `);

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Query = {
          __typename?: 'Query';
          a?: Maybe<Scalars['String']['output']>;
          b?: Maybe<Scalars['String']['output']>;
          c?: Maybe<Scalars['String']['output']>;
        };

        export type AQueryVariables = Exact<{ [key: string]: never; }>;


        export type AQuery = { __typename?: 'Query', a?: string | null };

        export type BQueryVariables = Exact<{ [key: string]: never; }>;


        export type BQuery = { __typename?: 'Query', b?: string | null };

        export type CFragment = { __typename?: 'Query', c?: string | null } & { ' $fragmentName'?: 'CFragment' };

        export const CFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"C"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"c"}}]}}]} as unknown as DocumentNode<CFragment, unknown>;
        export const ADocument = {"__meta__":{"hash":"b61b879c1eb0040bce65d70c8adfb1ae9360f52f"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"A"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;
        export const BDocument = {"__meta__":{"hash":"c3ea9f3f937d47d72c70055ea55c7cf88a35e608"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"B"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<BQuery, BQueryVariables>;"
      `);
    });

    it('mode="replaceDocumentWithHash"', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              persistedDocuments: {
                mode: 'replaceDocumentWithHash',
              },
            },
          },
        },
        emitLegacyCommonJSImports: false,
      });

      expect(result).toHaveLength(5);

      const persistedDocuments = result.find(file => file.filename === 'out1/persisted-documents.json');

      expect(persistedDocuments.content).toMatchInlineSnapshot(`
        "{
          "b61b879c1eb0040bce65d70c8adfb1ae9360f52f": "query A { a }",
          "c3ea9f3f937d47d72c70055ea55c7cf88a35e608": "query B { b }"
        }"
      `);

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Query = {
          __typename?: 'Query';
          a?: Maybe<Scalars['String']['output']>;
          b?: Maybe<Scalars['String']['output']>;
          c?: Maybe<Scalars['String']['output']>;
        };

        export type AQueryVariables = Exact<{ [key: string]: never; }>;


        export type AQuery = { __typename?: 'Query', a?: string | null };

        export type BQueryVariables = Exact<{ [key: string]: never; }>;


        export type BQuery = { __typename?: 'Query', b?: string | null };

        export type CFragment = { __typename?: 'Query', c?: string | null } & { ' $fragmentName'?: 'CFragment' };

        export const CFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"C"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"c"}}]}}]} as unknown as DocumentNode<CFragment, unknown>;
        export const ADocument = {"__meta__":{"hash":"b61b879c1eb0040bce65d70c8adfb1ae9360f52f"}} as unknown as DocumentNode<AQuery, AQueryVariables>;
        export const BDocument = {"__meta__":{"hash":"c3ea9f3f937d47d72c70055ea55c7cf88a35e608"}} as unknown as DocumentNode<BQuery, BQueryVariables>;"
      `);
    });

    it('hashPropertyName="custom_property_name"', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              persistedDocuments: {
                hashPropertyName: 'custom_property_name',
              },
            },
          },
        },
        emitLegacyCommonJSImports: false,
      });

      expect(result).toHaveLength(5);

      const persistedDocuments = result.find(file => file.filename === 'out1/persisted-documents.json');

      expect(persistedDocuments.content).toMatchInlineSnapshot(`
        "{
          "b61b879c1eb0040bce65d70c8adfb1ae9360f52f": "query A { a }",
          "c3ea9f3f937d47d72c70055ea55c7cf88a35e608": "query B { b }"
        }"
      `);

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Query = {
          __typename?: 'Query';
          a?: Maybe<Scalars['String']['output']>;
          b?: Maybe<Scalars['String']['output']>;
          c?: Maybe<Scalars['String']['output']>;
        };

        export type AQueryVariables = Exact<{ [key: string]: never; }>;


        export type AQuery = { __typename?: 'Query', a?: string | null };

        export type BQueryVariables = Exact<{ [key: string]: never; }>;


        export type BQuery = { __typename?: 'Query', b?: string | null };

        export type CFragment = { __typename?: 'Query', c?: string | null } & { ' $fragmentName'?: 'CFragment' };

        export const CFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"C"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"c"}}]}}]} as unknown as DocumentNode<CFragment, unknown>;
        export const ADocument = {"__meta__":{"custom_property_name":"b61b879c1eb0040bce65d70c8adfb1ae9360f52f"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"A"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;
        export const BDocument = {"__meta__":{"custom_property_name":"c3ea9f3f937d47d72c70055ea55c7cf88a35e608"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"B"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<BQuery, BQueryVariables>;"
      `);
    });

    it('embed metadata in executable document node', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: [
          /* GraphQL */ `
            query aaa {
              a
            }
          `,
          /* GraphQL */ `
            query bbb {
              b
            }
          `,
        ],
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              persistedDocuments: true,
              onExecutableDocumentNode(node) {
                return {
                  cacheKeys: [node.definitions[0].name.value],
                };
              },
            },
          },
        },
        emitLegacyCommonJSImports: false,
      });
      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Query = {
          __typename?: 'Query';
          a?: Maybe<Scalars['String']['output']>;
          b?: Maybe<Scalars['String']['output']>;
          c?: Maybe<Scalars['String']['output']>;
        };

        export type AaaQueryVariables = Exact<{ [key: string]: never; }>;


        export type AaaQuery = { __typename?: 'Query', a?: string | null };

        export type BbbQueryVariables = Exact<{ [key: string]: never; }>;


        export type BbbQuery = { __typename?: 'Query', b?: string | null };


        export const AaaDocument = {"__meta__":{"cacheKeys":["aaa"],"hash":"682f60dea844320c05fcb4fb6c4118015902c9a8"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"aaa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AaaQuery, AaaQueryVariables>;
        export const BbbDocument = {"__meta__":{"cacheKeys":["bbb"],"hash":"2a8e0849914b13ebc13b112ba5a502678d757511"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"bbb"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<BbbQuery, BbbQueryVariables>;"
      `);
    });

    it('hashAlgorithm="sha256"', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              persistedDocuments: {
                hashAlgorithm: 'sha256',
              },
            },
          },
        },
        emitLegacyCommonJSImports: false,
      });

      expect(result).toHaveLength(5);

      const persistedDocuments = result.find(file => file.filename === 'out1/persisted-documents.json');

      expect(persistedDocuments.content).toMatchInlineSnapshot(`
        "{
          "7d0eedabb966107835cf307a0ebaf93b5d2cb8c30228611ffe3d27a53c211a0c": "query A { a }",
          "a62a11aa72041e38d8c12ef77e1e7c208d9605db60bb5abb1717e8af98e4b410": "query B { b }"
        }"
      `);

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Query = {
          __typename?: 'Query';
          a?: Maybe<Scalars['String']['output']>;
          b?: Maybe<Scalars['String']['output']>;
          c?: Maybe<Scalars['String']['output']>;
        };

        export type AQueryVariables = Exact<{ [key: string]: never; }>;


        export type AQuery = { __typename?: 'Query', a?: string | null };

        export type BQueryVariables = Exact<{ [key: string]: never; }>;


        export type BQuery = { __typename?: 'Query', b?: string | null };

        export type CFragment = { __typename?: 'Query', c?: string | null } & { ' $fragmentName'?: 'CFragment' };

        export const CFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"C"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"c"}}]}}]} as unknown as DocumentNode<CFragment, unknown>;
        export const ADocument = {"__meta__":{"hash":"7d0eedabb966107835cf307a0ebaf93b5d2cb8c30228611ffe3d27a53c211a0c"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"A"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;
        export const BDocument = {"__meta__":{"hash":"a62a11aa72041e38d8c12ef77e1e7c208d9605db60bb5abb1717e8af98e4b410"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"B"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<BQuery, BQueryVariables>;"
      `);
    });

    // This test serves to demonstrate that the custom hash function can perform arbitrary logic
    // Removing whitespace has no real-world application but clearly shows the custom hash function is being used
    it('custom hash remove whitespace', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              persistedDocuments: {
                hashAlgorithm: (operation: string) => {
                  return operation.replace(/\s/g, '');
                },
              },
            },
          },
        },
        emitLegacyCommonJSImports: false,
      });

      expect(result).toHaveLength(5);

      const persistedDocuments = result.find(file => file.filename === 'out1/persisted-documents.json');

      expect(persistedDocuments.content).toMatchInlineSnapshot(`
        "{
          "queryA{a}": "query A { a }",
          "queryB{b}": "query B { b }"
        }"
      `);

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Query = {
          __typename?: 'Query';
          a?: Maybe<Scalars['String']['output']>;
          b?: Maybe<Scalars['String']['output']>;
          c?: Maybe<Scalars['String']['output']>;
        };

        export type AQueryVariables = Exact<{ [key: string]: never; }>;


        export type AQuery = { __typename?: 'Query', a?: string | null };

        export type BQueryVariables = Exact<{ [key: string]: never; }>;


        export type BQuery = { __typename?: 'Query', b?: string | null };

        export type CFragment = { __typename?: 'Query', c?: string | null } & { ' $fragmentName'?: 'CFragment' };

        export const CFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"C"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"c"}}]}}]} as unknown as DocumentNode<CFragment, unknown>;
        export const ADocument = {"__meta__":{"hash":"queryA{a}"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"A"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;
        export const BDocument = {"__meta__":{"hash":"queryB{b}"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"B"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<BQuery, BQueryVariables>;"
      `);
    });

    // Tests that the custom hash function can replicate the logic and behavior by re-implementing the existing hash function (for sha256)
    it('custom hash sha256', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              persistedDocuments: {
                hashAlgorithm: (operation: string) => {
                  const shasum = crypto.createHash('sha256');
                  shasum.update(operation);
                  return shasum.digest('hex');
                },
              },
            },
          },
        },
        emitLegacyCommonJSImports: false,
      });

      expect(result).toHaveLength(5);

      const persistedDocuments = result.find(file => file.filename === 'out1/persisted-documents.json');

      expect(persistedDocuments.content).toMatchInlineSnapshot(`
        "{
          "7d0eedabb966107835cf307a0ebaf93b5d2cb8c30228611ffe3d27a53c211a0c": "query A { a }",
          "a62a11aa72041e38d8c12ef77e1e7c208d9605db60bb5abb1717e8af98e4b410": "query B { b }"
        }"
      `);

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Query = {
          __typename?: 'Query';
          a?: Maybe<Scalars['String']['output']>;
          b?: Maybe<Scalars['String']['output']>;
          c?: Maybe<Scalars['String']['output']>;
        };

        export type AQueryVariables = Exact<{ [key: string]: never; }>;


        export type AQuery = { __typename?: 'Query', a?: string | null };

        export type BQueryVariables = Exact<{ [key: string]: never; }>;


        export type BQuery = { __typename?: 'Query', b?: string | null };

        export type CFragment = { __typename?: 'Query', c?: string | null } & { ' $fragmentName'?: 'CFragment' };

        export const CFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"C"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"c"}}]}}]} as unknown as DocumentNode<CFragment, unknown>;
        export const ADocument = {"__meta__":{"hash":"7d0eedabb966107835cf307a0ebaf93b5d2cb8c30228611ffe3d27a53c211a0c"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"A"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;
        export const BDocument = {"__meta__":{"hash":"a62a11aa72041e38d8c12ef77e1e7c208d9605db60bb5abb1717e8af98e4b410"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"B"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<BQuery, BQueryVariables>;"
      `);
    });

    // Custom hash example used in `preset-client.mdx` docs
    it('custom hash docs sha512', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              persistedDocuments: {
                hashAlgorithm: (operation: string) => {
                  const shasum = crypto.createHash('sha512');
                  shasum.update(operation);
                  return shasum.digest('hex');
                },
              },
            },
          },
        },
        emitLegacyCommonJSImports: false,
      });

      expect(result).toHaveLength(5);

      const persistedDocuments = result.find(file => file.filename === 'out1/persisted-documents.json');

      expect(persistedDocuments.content).toMatchInlineSnapshot(`
        "{
          "a82d8b22f2bf805563146dc8ad80b2eb054845441539e3a5a69d1f534bb5bc0bd4f9470053b9f61b6aa1966cfc2f67406258102e5ee3a356a5d171506f3ede50": "query A { a }",
          "bdc3d5b1e0dc35d9d21f8baadf515c472850baf279c8dd266fb21e8b8b29758d2386329f19a93dc101f3a6dd1214f5214835451e7eaf4410408d5c89f2e20a09": "query B { b }"
        }"
      `);

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Query = {
          __typename?: 'Query';
          a?: Maybe<Scalars['String']['output']>;
          b?: Maybe<Scalars['String']['output']>;
          c?: Maybe<Scalars['String']['output']>;
        };

        export type AQueryVariables = Exact<{ [key: string]: never; }>;


        export type AQuery = { __typename?: 'Query', a?: string | null };

        export type BQueryVariables = Exact<{ [key: string]: never; }>;


        export type BQuery = { __typename?: 'Query', b?: string | null };

        export type CFragment = { __typename?: 'Query', c?: string | null } & { ' $fragmentName'?: 'CFragment' };

        export const CFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"C"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"c"}}]}}]} as unknown as DocumentNode<CFragment, unknown>;
        export const ADocument = {"__meta__":{"hash":"a82d8b22f2bf805563146dc8ad80b2eb054845441539e3a5a69d1f534bb5bc0bd4f9470053b9f61b6aa1966cfc2f67406258102e5ee3a356a5d171506f3ede50"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"A"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;
        export const BDocument = {"__meta__":{"hash":"bdc3d5b1e0dc35d9d21f8baadf515c472850baf279c8dd266fb21e8b8b29758d2386329f19a93dc101f3a6dd1214f5214835451e7eaf4410408d5c89f2e20a09"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"B"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<BQuery, BQueryVariables>;"
      `);
    });
  });

  it('correctly handle fragment references', async () => {
    const result = await executeCodegen({
      schema: /* GraphQL */ `
        type Query {
          a: A!
        }

        type A {
          b: String!
          a: A!
        }
      `,
      documents: [
        /* GraphQL */ `
          fragment AC on A {
            b
          }
        `,
        /* GraphQL */ `
          fragment AA on A {
            b
          }
        `,
        /* GraphQL */ `
          fragment AB on A {
            b
            ...AC
            ...AA
          }
        `,
        /* GraphQL */ `
          query OI {
            a {
              ...AB
              ...AC
            }
          }
        `,
      ],
      generates: {
        'out1/': {
          preset,
          plugins: [],
        },
      },
    });
    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
      export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: { input: string; output: string; }
        String: { input: string; output: string; }
        Boolean: { input: boolean; output: boolean; }
        Int: { input: number; output: number; }
        Float: { input: number; output: number; }
      };

      export type A = {
        __typename?: 'A';
        a: A;
        b: Scalars['String']['output'];
      };

      export type Query = {
        __typename?: 'Query';
        a: A;
      };

      export type AbFragment = (
        { __typename?: 'A', b: string }
        & { ' $fragmentRefs'?: { 'AcFragment': AcFragment;'AaFragment': AaFragment } }
      ) & { ' $fragmentName'?: 'AbFragment' };

      export type AaFragment = { __typename?: 'A', b: string } & { ' $fragmentName'?: 'AaFragment' };

      export type OiQueryVariables = Exact<{ [key: string]: never; }>;


      export type OiQuery = { __typename?: 'Query', a: (
          { __typename?: 'A' }
          & { ' $fragmentRefs'?: { 'AbFragment': AbFragment;'AcFragment': AcFragment } }
        ) };

      export type AcFragment = { __typename?: 'A', b: string } & { ' $fragmentName'?: 'AcFragment' };

      export const AcFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AC"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"A"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<AcFragment, unknown>;
      export const AaFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AA"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"A"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<AaFragment, unknown>;
      export const AbFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AB"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"A"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"AC"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"AA"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AC"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"A"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AA"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"A"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}}]} as unknown as DocumentNode<AbFragment, unknown>;
      export const OiDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OI"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AB"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"AC"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AC"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"A"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AA"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"A"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AB"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"A"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"b"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"AC"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"AA"}}]}}]} as unknown as DocumentNode<OiQuery, OiQueryVariables>;"
    `);
  });

  describe('handles @defer directive', () => {
    it('generates correct types and metadata', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              foo: Foo
              foos: [Foo]
            }

            type Foo {
              id: String
              value: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/with-deferred-fragment.ts'),
        generates: {
          'out1/': {
            preset,
          },
        },
      });

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Foo = {
          __typename?: 'Foo';
          id?: Maybe<Scalars['String']['output']>;
          value?: Maybe<Scalars['String']['output']>;
        };

        export type Query = {
          __typename?: 'Query';
          foo?: Maybe<Foo>;
          foos?: Maybe<Array<Maybe<Foo>>>;
        };

        export type FooQueryVariables = Exact<{ [key: string]: never; }>;


        export type FooQuery = { __typename?: 'Query', foo?: { __typename?: 'Foo' } & (
            { __typename?: 'Foo' }
            & { ' $fragmentRefs'?: { 'FooFragment': Incremental<FooFragment> } }
          ) | null };

        export type FoosQueryVariables = Exact<{ [key: string]: never; }>;


        export type FoosQuery = { __typename?: 'Query', foos?: Array<{ __typename?: 'Foo' } & (
            { __typename?: 'Foo' }
            & { ' $fragmentRefs'?: { 'FooFragment': Incremental<FooFragment> } }
          ) | null> | null };

        export type FooFragment = { __typename?: 'Foo', value?: string | null } & { ' $fragmentName'?: 'FooFragment' };

        export type FooFragment = { __typename?: 'Foo', id?: string | null } & ({ __typename?: 'Foo', value?: string | null } | { __typename?: 'Foo', value?: never }) & { ' $fragmentName'?: 'FooFragment' };

        export const FooFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Foo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Foo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<FooFragment, unknown>;
        export const FooFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"foo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Foo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Foo"}},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"defer"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]} as unknown as DocumentNode<FooFragment, unknown>;
        export const FooDocument = {"__meta__":{"deferredFields":{"Foo":["value"]}},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Foo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"foo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Foo"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"defer"}}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Foo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Foo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<FooQuery, FooQueryVariables>;
        export const FoosDocument = {"__meta__":{"deferredFields":{"Foo":["value"]}},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Foos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"foos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Foo"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"defer"}}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Foo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Foo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<FoosQuery, FoosQueryVariables>;"
      `);
    });

    it('works with persisted documents', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              foo: Foo
              foos: [Foo]
            }

            type Foo {
              id: String
              value: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/with-deferred-fragment.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              persistedDocuments: true,
            },
          },
        },
      });

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Foo = {
          __typename?: 'Foo';
          id?: Maybe<Scalars['String']['output']>;
          value?: Maybe<Scalars['String']['output']>;
        };

        export type Query = {
          __typename?: 'Query';
          foo?: Maybe<Foo>;
          foos?: Maybe<Array<Maybe<Foo>>>;
        };

        export type FooQueryVariables = Exact<{ [key: string]: never; }>;


        export type FooQuery = { __typename?: 'Query', foo?: { __typename?: 'Foo' } & (
            { __typename?: 'Foo' }
            & { ' $fragmentRefs'?: { 'FooFragment': Incremental<FooFragment> } }
          ) | null };

        export type FoosQueryVariables = Exact<{ [key: string]: never; }>;


        export type FoosQuery = { __typename?: 'Query', foos?: Array<{ __typename?: 'Foo' } & (
            { __typename?: 'Foo' }
            & { ' $fragmentRefs'?: { 'FooFragment': Incremental<FooFragment> } }
          ) | null> | null };

        export type FooFragment = { __typename?: 'Foo', value?: string | null } & { ' $fragmentName'?: 'FooFragment' };

        export type FooFragment = { __typename?: 'Foo', id?: string | null } & ({ __typename?: 'Foo', value?: string | null } | { __typename?: 'Foo', value?: never }) & { ' $fragmentName'?: 'FooFragment' };

        export const FooFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Foo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Foo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<FooFragment, unknown>;
        export const FooFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"foo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Foo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Foo"}},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"defer"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]} as unknown as DocumentNode<FooFragment, unknown>;
        export const FooDocument = {"__meta__":{"hash":"39c47d2da0fb0e6867abbe2ec942d9858f2d76c7","deferredFields":{"Foo":["value"]}},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Foo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"foo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Foo"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"defer"}}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Foo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Foo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<FooQuery, FooQueryVariables>;
        export const FoosDocument = {"__meta__":{"hash":"8aba765173b2302b9857334e9959d97a2168dbc8","deferredFields":{"Foo":["value"]}},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Foos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"foos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Foo"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"defer"}}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Foo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Foo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<FoosQuery, FoosQueryVariables>;"
      `);
    });

    it('works with documentMode: string', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              foo: Foo
              foos: [Foo]
            }

            type Foo {
              id: String
              value: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/with-deferred-fragment.ts'),
        generates: {
          'out1/': {
            preset,
            config: {
              documentMode: 'string',
            },
          },
        },
      });

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Foo = {
          __typename?: 'Foo';
          id?: Maybe<Scalars['String']['output']>;
          value?: Maybe<Scalars['String']['output']>;
        };

        export type Query = {
          __typename?: 'Query';
          foo?: Maybe<Foo>;
          foos?: Maybe<Array<Maybe<Foo>>>;
        };

        export type FooQueryVariables = Exact<{ [key: string]: never; }>;


        export type FooQuery = { __typename?: 'Query', foo?: { __typename?: 'Foo' } & (
            { __typename?: 'Foo' }
            & { ' $fragmentRefs'?: { 'FooFragment': Incremental<FooFragment> } }
          ) | null };

        export type FoosQueryVariables = Exact<{ [key: string]: never; }>;


        export type FoosQuery = { __typename?: 'Query', foos?: Array<{ __typename?: 'Foo' } & (
            { __typename?: 'Foo' }
            & { ' $fragmentRefs'?: { 'FooFragment': Incremental<FooFragment> } }
          ) | null> | null };

        export type FooFragment = { __typename?: 'Foo', value?: string | null } & { ' $fragmentName'?: 'FooFragment' };

        export type FooFragment = { __typename?: 'Foo', id?: string | null } & ({ __typename?: 'Foo', value?: string | null } | { __typename?: 'Foo', value?: never }) & { ' $fragmentName'?: 'FooFragment' };

        export class TypedDocumentString<TResult, TVariables>
          extends String
          implements DocumentTypeDecoration<TResult, TVariables>
        {
          __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];
          private value: string;
          public __meta__?: Record<string, any> | undefined;

          constructor(value: string, __meta__?: Record<string, any> | undefined) {
            super(value);
            this.value = value;
            this.__meta__ = __meta__;
          }

          toString(): string & DocumentTypeDecoration<TResult, TVariables> {
            return this.value;
          }
        }
        export const FooFragmentDoc = new TypedDocumentString(\`
            fragment Foo on Foo {
          value
        }
            \`, {"fragmentName":"Foo"}) as unknown as TypedDocumentString<FooFragment, unknown>;
        export const FooFragmentDoc = new TypedDocumentString(\`
            fragment foo on Foo {
          id
          ... on Foo @defer {
            value
          }
        }
            \`, {"fragmentName":"foo"}) as unknown as TypedDocumentString<FooFragment, unknown>;
        export const FooDocument = new TypedDocumentString(\`
            query Foo {
          foo {
            ...Foo @defer
          }
        }
            fragment Foo on Foo {
          value
        }
        fragment foo on Foo {
          id
          ... on Foo @defer {
            value
          }
        }\`, {"deferredFields":{"Foo":["value"]}}) as unknown as TypedDocumentString<FooQuery, FooQueryVariables>;
        export const FoosDocument = new TypedDocumentString(\`
            query Foos {
          foos {
            ...Foo @defer
          }
        }
            fragment Foo on Foo {
          value
        }
        fragment foo on Foo {
          id
          ... on Foo @defer {
            value
          }
        }\`, {"deferredFields":{"Foo":["value"]}}) as unknown as TypedDocumentString<FoosQuery, FoosQueryVariables>;"
      `);
    });

    it('works with documentMode: string and persisted documents', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              foo: Foo
              foos: [Foo]
            }

            type Foo {
              id: String
              value: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/with-deferred-fragment.ts'),
        generates: {
          'out1/': {
            preset,
            presetConfig: {
              persistedDocuments: true,
            },
            config: {
              documentMode: 'string',
            },
          },
        },
      });

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Foo = {
          __typename?: 'Foo';
          id?: Maybe<Scalars['String']['output']>;
          value?: Maybe<Scalars['String']['output']>;
        };

        export type Query = {
          __typename?: 'Query';
          foo?: Maybe<Foo>;
          foos?: Maybe<Array<Maybe<Foo>>>;
        };

        export type FooQueryVariables = Exact<{ [key: string]: never; }>;


        export type FooQuery = { __typename?: 'Query', foo?: { __typename?: 'Foo' } & (
            { __typename?: 'Foo' }
            & { ' $fragmentRefs'?: { 'FooFragment': Incremental<FooFragment> } }
          ) | null };

        export type FoosQueryVariables = Exact<{ [key: string]: never; }>;


        export type FoosQuery = { __typename?: 'Query', foos?: Array<{ __typename?: 'Foo' } & (
            { __typename?: 'Foo' }
            & { ' $fragmentRefs'?: { 'FooFragment': Incremental<FooFragment> } }
          ) | null> | null };

        export type FooFragment = { __typename?: 'Foo', value?: string | null } & { ' $fragmentName'?: 'FooFragment' };

        export type FooFragment = { __typename?: 'Foo', id?: string | null } & ({ __typename?: 'Foo', value?: string | null } | { __typename?: 'Foo', value?: never }) & { ' $fragmentName'?: 'FooFragment' };

        export class TypedDocumentString<TResult, TVariables>
          extends String
          implements DocumentTypeDecoration<TResult, TVariables>
        {
          __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];
          private value: string;
          public __meta__?: Record<string, any> | undefined;

          constructor(value: string, __meta__?: Record<string, any> | undefined) {
            super(value);
            this.value = value;
            this.__meta__ = __meta__;
          }

          toString(): string & DocumentTypeDecoration<TResult, TVariables> {
            return this.value;
          }
        }
        export const FooFragmentDoc = new TypedDocumentString(\`
            fragment Foo on Foo {
          value
        }
            \`, {"fragmentName":"Foo"}) as unknown as TypedDocumentString<FooFragment, unknown>;
        export const FooFragmentDoc = new TypedDocumentString(\`
            fragment foo on Foo {
          id
          ... on Foo @defer {
            value
          }
        }
            \`, {"fragmentName":"foo"}) as unknown as TypedDocumentString<FooFragment, unknown>;
        export const FooDocument = new TypedDocumentString(\`
            query Foo {
          foo {
            ...Foo @defer
          }
        }
            fragment Foo on Foo {
          value
        }
        fragment foo on Foo {
          id
          ... on Foo @defer {
            value
          }
        }\`, {"hash":"2687841b00fe0b3b4fd0dfa2e943f80936594f58","deferredFields":{"Foo":["value"]}}) as unknown as TypedDocumentString<FooQuery, FooQueryVariables>;
        export const FoosDocument = new TypedDocumentString(\`
            query Foos {
          foos {
            ...Foo @defer
          }
        }
            fragment Foo on Foo {
          value
        }
        fragment foo on Foo {
          id
          ... on Foo @defer {
            value
          }
        }\`, {"hash":"8db613cc1f12f64dbde9cd6fef167fd12246330d","deferredFields":{"Foo":["value"]}}) as unknown as TypedDocumentString<FoosQuery, FoosQueryVariables>;"
      `);
    });
  });

  describe('documentMode: "string"', () => {
    it('generates correct types', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              foo: Foo
              foos: [Foo]
            }

            type Foo {
              value: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/with-fragment.ts'),
        generates: {
          'out1/': {
            preset,
            config: {
              documentMode: 'string',
            },
          },
        },
      });

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Foo = {
          __typename?: 'Foo';
          value?: Maybe<Scalars['String']['output']>;
        };

        export type Query = {
          __typename?: 'Query';
          foo?: Maybe<Foo>;
          foos?: Maybe<Array<Maybe<Foo>>>;
        };

        export type FooQueryVariables = Exact<{ [key: string]: never; }>;


        export type FooQuery = { __typename?: 'Query', foo?: (
            { __typename?: 'Foo' }
            & { ' $fragmentRefs'?: { 'FooFragment': FooFragment } }
          ) | null };

        export type FoosQueryVariables = Exact<{ [key: string]: never; }>;


        export type FoosQuery = { __typename?: 'Query', foos?: Array<(
            { __typename?: 'Foo' }
            & { ' $fragmentRefs'?: { 'FooFragment': FooFragment } }
          ) | null> | null };

        export type FooFragment = { __typename?: 'Foo', value?: string | null } & { ' $fragmentName'?: 'FooFragment' };

        export class TypedDocumentString<TResult, TVariables>
          extends String
          implements DocumentTypeDecoration<TResult, TVariables>
        {
          __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];
          private value: string;
          public __meta__?: Record<string, any> | undefined;

          constructor(value: string, __meta__?: Record<string, any> | undefined) {
            super(value);
            this.value = value;
            this.__meta__ = __meta__;
          }

          toString(): string & DocumentTypeDecoration<TResult, TVariables> {
            return this.value;
          }
        }
        export const FooFragmentDoc = new TypedDocumentString(\`
            fragment Foo on Foo {
          value
        }
            \`, {"fragmentName":"Foo"}) as unknown as TypedDocumentString<FooFragment, unknown>;
        export const FooDocument = new TypedDocumentString(\`
            query Foo {
          foo {
            ...Foo
          }
        }
            fragment Foo on Foo {
          value
        }\`) as unknown as TypedDocumentString<FooQuery, FooQueryVariables>;
        export const FoosDocument = new TypedDocumentString(\`
            query Foos {
          foos {
            ...Foo
          }
        }
            fragment Foo on Foo {
          value
        }\`) as unknown as TypedDocumentString<FoosQuery, FoosQueryVariables>;"
      `);
    });

    it('graphql overloads have a nice result type', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              foo: Foo
              foos: [Foo]
            }

            type Foo {
              value: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/with-fragment.ts'),
        generates: {
          'out1/': {
            preset,
            config: {
              documentMode: 'string',
            },
          },
        },
      });

      const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
      expect(gqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import * as types from './graphql';



        /**
         * Map of all GraphQL operations in the project.
         *
         * This map has several performance disadvantages:
         * 1. It is not tree-shakeable, so it will include all operations in the project.
         * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
         * 3. It does not support dead code elimination, so it will add unused operations.
         *
         * Therefore it is highly recommended to use the babel or swc plugin for production.
         * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
         */
        type Documents = {
            "\\n  query Foo {\\n    foo {\\n      ...Foo\\n    }\\n  }\\n": typeof types.FooDocument,
            "\\n  query Foos {\\n    foos {\\n      ...Foo\\n    }\\n  }\\n": typeof types.FoosDocument,
            "\\n  fragment Foo on Foo {\\n    value\\n  }\\n": typeof types.FooFragmentDoc,
        };
        const documents: Documents = {
            "\\n  query Foo {\\n    foo {\\n      ...Foo\\n    }\\n  }\\n": types.FooDocument,
            "\\n  query Foos {\\n    foos {\\n      ...Foo\\n    }\\n  }\\n": types.FoosDocument,
            "\\n  fragment Foo on Foo {\\n    value\\n  }\\n": types.FooFragmentDoc,
        };

        /**
         * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
         */
        export function graphql(source: "\\n  query Foo {\\n    foo {\\n      ...Foo\\n    }\\n  }\\n"): typeof import('./graphql').FooDocument;
        /**
         * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
         */
        export function graphql(source: "\\n  query Foos {\\n    foos {\\n      ...Foo\\n    }\\n  }\\n"): typeof import('./graphql').FoosDocument;
        /**
         * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
         */
        export function graphql(source: "\\n  fragment Foo on Foo {\\n    value\\n  }\\n"): typeof import('./graphql').FooFragmentDoc;


        export function graphql(source: string) {
          return (documents as any)[source] ?? {};
        }
        "
      `);
    });

    it('correctly resolves nested fragments', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            scalar Date

            type Query {
              video(id: ID!): Video!
            }

            interface Video {
              id: ID!
              title: String!
            }

            type Movie implements Video {
              id: ID!
              title: String!
              releaseDate: Date!
              collection: Collection
            }

            type Collection {
              id: ID!
              title: String!
            }

            type Episode implements Video {
              id: ID!
              title: String!
              show: Show!
              releaseDate: Date!
            }

            type Show {
              id: ID!
              title: String!
              releaseDate: Date!
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/with-nested-fragment.ts'),
        generates: {
          'out1/': {
            preset,
            config: {
              documentMode: 'string',
            },
          },
        },
      });

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toBeSimilarStringTo(`
        export const VideoDocument = new TypedDocumentString(\`
          query Video($id: ID!) {
            video(id: $id) {
              ...DetailsFragment
              __typename
            }
          }
          fragment EpisodeFragment on Episode {
            id
            title
            show {
              id
              title
            }
            releaseDate
            __typename
          }
          fragment MovieFragment on Movie {
            id
            title
            collection {
              id
            }
            releaseDate
            __typename
          }
          fragment DetailsFragment on Video {
            title
            __typename
            ...MovieFragment
            ...EpisodeFragment
          }\`) as unknown as TypedDocumentString<VideoQuery, VideoQueryVariables>;
      `);
    });

    it('correctly skips the typename addition for the root node for subscriptions', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            schema {
              query: Query
              mutation: Mutation
              subscription: Subscription
            }

            type Region {
              regionId: Int!
              regionDescription: String!
            }

            type Subscription {
              onRegionCreated: Region!
            }

            type Query {
              regions: [Region]
            }

            type Mutation {
              createRegion(regionDescription: String!): Region
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/subscription-root-node.ts'),
        generates: {
          'out1/': {
            preset,
            config: {
              documentMode: 'string',
            },
            documentTransforms: [addTypenameSelectionDocumentTransform],
          },
        },
      });

      const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
      expect(graphqlFile.content).toBeSimilarStringTo(`
        /* eslint-disable */
        import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export type Mutation = {
          __typename?: 'Mutation';
          createRegion?: Maybe<Region>;
        };


        export type MutationCreateRegionArgs = {
          regionDescription: Scalars['String']['input'];
        };

        export type Query = {
          __typename?: 'Query';
          regions?: Maybe<Array<Maybe<Region>>>;
        };

        export type Region = {
          __typename?: 'Region';
          regionDescription: Scalars['String']['output'];
          regionId: Scalars['Int']['output'];
        };

        export type Subscription = {
          __typename?: 'Subscription';
          onRegionCreated: Region;
        };

        export type OnRegionCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


        export type OnRegionCreatedSubscription = { __typename?: 'Subscription', onRegionCreated: { __typename: 'Region', regionId: number, regionDescription: string } };

        export class TypedDocumentString<TResult, TVariables>
          extends String
          implements DocumentTypeDecoration<TResult, TVariables>
        {
          __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];
          private value: string;
          public __meta__?: Record<string, any> | undefined;

          constructor(value: string, __meta__?: Record<string, any> | undefined) {
            super(value);
            this.value = value;
            this.__meta__ = __meta__;
          }

          toString(): string & DocumentTypeDecoration<TResult, TVariables> {
            return this.value;
          }
        }

        export const OnRegionCreatedDocument = new TypedDocumentString(\`
            subscription onRegionCreated {
          onRegionCreated {
            __typename
            regionId
            regionDescription
          }
        }
            \`) as unknown as TypedDocumentString<OnRegionCreatedSubscription, OnRegionCreatedSubscriptionVariables>;
      `);
    });
  });

  it('support enumsAsConst option', async () => {
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            thing: Thing
          }
          type Thing {
            color: Color!
          }
          enum Color {
            RED
            BLUE
          }
        `,
      ],
      documents: path.join(__dirname, 'fixtures/enum.ts'),
      generates: {
        'out1/': {
          preset,
          config: {
            enumsAsConst: true,
          },
        },
      },
    });
    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile.content).toBeSimilarStringTo(`
        /* eslint-disable */
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
        export type Maybe<T> = T | null;
        export type InputMaybe<T> = Maybe<T>;
        export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
        export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
        export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** All built-in and custom scalars, mapped to their actual values */
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
        };

        export const Color = {
          Blue: 'BLUE',
          Red: 'RED'
        } as const;

        export type Color = typeof Color[keyof typeof Color];
        export type Query = {
          __typename?: 'Query';
          thing?: Maybe<Thing>;
        };

        export type Thing = {
          __typename?: 'Thing';
          color: Color;
        };

        export type FavoriteColorQueryVariables = Exact<{ [key: string]: never; }>;


        export type FavoriteColorQuery = { __typename?: 'Query', thing?: { __typename?: 'Thing', color: Color } | null };


        export const FavoriteColorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FavoriteColor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"thing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<FavoriteColorQuery, FavoriteColorQueryVariables>;
    `);
  });
});
