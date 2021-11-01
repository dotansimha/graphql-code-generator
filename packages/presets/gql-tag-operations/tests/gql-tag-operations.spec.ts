import { executeCodegen } from '@graphql-codegen/cli';
import path from 'path';
import { preset } from '../src';

describe('gql-tag-operations-preset', () => {
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
        'out1.ts': {
          preset,
          plugins: [],
        },
      },
    });

    expect(result[0].content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as graphql from './graphql';
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      const documents = {
          \\"\\\\n  query A {\\\\n    a\\\\n  }\\\\n\\": graphql.ADocument,
          \\"\\\\n  query B {\\\\n    b\\\\n  }\\\\n\\": graphql.BDocument,
          \\"\\\\n  fragment C on Query {\\\\n    c\\\\n  }\\\\n\\": graphql.CFragmentDoc,
      };

      export function gql(source: \\"\\\\n  query A {\\\\n    a\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query A {\\\\n    a\\\\n  }\\\\n\\"];
      export function gql(source: \\"\\\\n  query B {\\\\n    b\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query B {\\\\n    b\\\\n  }\\\\n\\"];
      export function gql(source: \\"\\\\n  fragment C on Query {\\\\n    c\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  fragment C on Query {\\\\n    c\\\\n  }\\\\n\\"];

      export function gql(source: string): unknown;
      export function gql(source: string) {
        return (documents as any)[source] ?? {};
      }

      export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
    `);
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
        'out1.ts': {
          preset,
          plugins: [],
        },
      },
    });
    expect(result[0].content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as graphql from './graphql';
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      const documents = {
          \\"\\\\n  query a {\\\\n    a\\\\n  }\\\\n\\": graphql.ADocument,
          \\"\\\\n  query b {\\\\n    b\\\\n  }\\\\n\\": graphql.BDocument,
          \\"\\\\n  fragment C on Query {\\\\n    c\\\\n  }\\\\n\\": graphql.CFragmentDoc,
      };

      export function gql(source: \\"\\\\n  query a {\\\\n    a\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query a {\\\\n    a\\\\n  }\\\\n\\"];
      export function gql(source: \\"\\\\n  query b {\\\\n    b\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query b {\\\\n    b\\\\n  }\\\\n\\"];
      export function gql(source: \\"\\\\n  fragment C on Query {\\\\n    c\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  fragment C on Query {\\\\n    c\\\\n  }\\\\n\\"];

      export function gql(source: string): unknown;
      export function gql(source: string) {
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
        'out1.ts': {
          preset,
          plugins: [],
        },
      },
      config: {
        useTypeImports: true,
      },
    });

    expect(result.length).toBe(2);

    expect(result[0].content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as graphql from './graphql';
      import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      const documents = {
          \\"\\\\n  query A {\\\\n    a\\\\n  }\\\\n\\": graphql.ADocument,
          \\"\\\\n  query B {\\\\n    b\\\\n  }\\\\n\\": graphql.BDocument,
          \\"\\\\n  fragment C on Query {\\\\n    c\\\\n  }\\\\n\\": graphql.CFragmentDoc,
      };

      export function gql(source: \\"\\\\n  query A {\\\\n    a\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query A {\\\\n    a\\\\n  }\\\\n\\"];
      export function gql(source: \\"\\\\n  query B {\\\\n    b\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query B {\\\\n    b\\\\n  }\\\\n\\"];
      export function gql(source: \\"\\\\n  fragment C on Query {\\\\n    c\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  fragment C on Query {\\\\n    c\\\\n  }\\\\n\\"];

      export function gql(source: string): unknown;
      export function gql(source: string) {
        return (documents as any)[source] ?? {};
      }

      export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
    `);
    expect(result[1].content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
      /** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export type Query = {
        __typename?: 'Query';
        a?: Maybe<Scalars['String']>;
        b?: Maybe<Scalars['String']>;
        c?: Maybe<Scalars['String']>;
      };

      export type AQueryVariables = Exact<{ [key: string]: never; }>;


      export type AQuery = { __typename?: 'Query', a?: string | null };

      export type BQueryVariables = Exact<{ [key: string]: never; }>;


      export type BQuery = { __typename?: 'Query', b?: string | null };

      export type CFragment = { __typename?: 'Query', c?: string | null };

      export const CFragmentDoc = {\\"kind\\":\\"Document\\",\\"definitions\\":[{\\"kind\\":\\"FragmentDefinition\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"C\\"},\\"typeCondition\\":{\\"kind\\":\\"NamedType\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Query\\"}},\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"c\\"}}]}}]} as unknown as DocumentNode<CFragment, unknown>;
      export const ADocument = {\\"kind\\":\\"Document\\",\\"definitions\\":[{\\"kind\\":\\"OperationDefinition\\",\\"operation\\":\\"query\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"A\\"},\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"a\\"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;
      export const BDocument = {\\"kind\\":\\"Document\\",\\"definitions\\":[{\\"kind\\":\\"OperationDefinition\\",\\"operation\\":\\"query\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"B\\"},\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"b\\"}}]}}]} as unknown as DocumentNode<BQuery, BQueryVariables>;"
    `);

    expect(result[0].content).toContain(
      "import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'"
    );
    expect(result[1].content).toContain(
      "import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'"
    );
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
        'out1.ts': {
          preset,
          plugins: [],
        },
      },
      config: {
        useTypeImports: true,
      },
    });

    expect(result.length).toBe(2);

    expect(result[0].content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as graphql from './graphql';
      import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      const documents = {
          \\"\\\\n  query a {\\\\n    a\\\\n  }\\\\n\\": graphql.ADocument,
      };

      export function gql(source: \\"\\\\n  query a {\\\\n    a\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query a {\\\\n    a\\\\n  }\\\\n\\"];

      export function gql(source: string): unknown;
      export function gql(source: string) {
        return (documents as any)[source] ?? {};
      }

      export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
    `);

    expect(result[1].content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
      /** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };

      export type Query = {
        __typename?: 'Query';
        a?: Maybe<Scalars['String']>;
      };

      export type AQueryVariables = Exact<{ [key: string]: never; }>;


      export type AQuery = { __typename?: 'Query', a?: string | null };


      export const ADocument = {\\"kind\\":\\"Document\\",\\"definitions\\":[{\\"kind\\":\\"OperationDefinition\\",\\"operation\\":\\"query\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"a\\"},\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"a\\"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;"
    `);

    expect(result[0].content.match(/query a {/g).length).toBe(3);
  });
});
