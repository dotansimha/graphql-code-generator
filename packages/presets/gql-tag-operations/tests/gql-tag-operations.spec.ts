import { executeCodegen } from '@graphql-codegen/cli';
import '@graphql-codegen/testing';
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
        out1: {
          preset,
          plugins: [],
        },
      },
    });

    expect(result).toHaveLength(3);
    // index.ts (re-exports)
    expect(result[0].filename).toEqual('out1/index.ts');
    expect(result[0].content).toEqual('export * from "./gql"');

    // gql.ts
    expect(result[1].filename).toEqual('out1/gql.ts');
    expect(result[1].content).toMatchInlineSnapshot(`
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

    // graphql.ts
    expect(result[2].filename).toEqual('out1/graphql.ts');
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
        out1: {
          preset,
          plugins: [],
        },
      },
    });

    expect(result).toHaveLength(3);
    // index.ts (re-exports)
    expect(result[0].filename).toEqual('out1/index.ts');
    expect(result[0].content).toEqual('export * from "./gql"');

    // gql.ts
    expect(result[1].filename).toEqual('out1/gql.ts');
    expect(result[1].content).toMatchInlineSnapshot(`
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

    // graphql.ts
    expect(result[2].filename).toEqual('out1/graphql.ts');
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

    expect(result.length).toBe(3);

    expect(result[1].content).toMatchInlineSnapshot(`
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
    expect(result[2].content).toMatchInlineSnapshot(`
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

    expect(result[1].content).toContain(
      "import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'"
    );
    expect(result[2].content).toContain(
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

    expect(result.length).toBe(3);

    expect(result[1].content).toMatchInlineSnapshot(`
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

    expect(result[2].content).toMatchInlineSnapshot(`
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

    expect(result[1].content.match(/query a {/g).length).toBe(3);
  });

  describe('fragment masking', () => {
    it('fragmentMasking: true', async () => {
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
            presetConfig: {
              fragmentMasking: true,
            },
          },
        },
      });

      expect(result).toHaveLength(4);
      expect(result.map(res => res.filename)).toEqual([
        'out1.ts/fragment-masking.ts',
        'out1.ts/index.ts',
        'out1.ts/gql.ts',
        'out1.ts/graphql.ts',
      ]);

      expect(result[1].content).toMatchInlineSnapshot(`
      "export * from \\"./gql\\"
      export * from \\"./fragment-masking\\""
      `);

      expect(result[0].content).toMatchInlineSnapshot(`
      "import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';


      export type FragmentType<TDocumentType extends DocumentNode<any, any>> = TDocumentType extends DocumentNode<
        infer TType,
        any
      >
        ? TType extends { ' $fragmentName': infer TKey }
          ? TKey extends string
            ? { ' $fragmentRefs': { [key in TKey]: TType } }
            : never
          : never
        : never;


      export function useFragment<TType>(
        _documentNode: DocumentNode<TType, any>,
        fragmentType: FragmentType<DocumentNode<TType, any>>
      ): TType {
        return fragmentType as any
      }
      "
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
          'out1.ts': {
            preset,
            plugins: [],
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
          'out1.ts': {
            preset,
            plugins: [],
            presetConfig: {
              fragmentMasking: {
                unmaskFunctionName: 'iLikeTurtles',
              },
            },
          },
        },
      });

      expect(result).toHaveLength(4);
      expect(result[0].content).toMatchSnapshot(`
      "import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';


      export type FragmentType<TDocumentType extends DocumentNode<any, any>> = TDocumentType extends DocumentNode<
        infer TType,
        any
      >
        ? TType extends { ' $fragmentName': infer TKey }
          ? TKey extends string
            ? { ' $fragmentRefs': { [key in TKey]: TType } }
            : never
          : never
        : never;


      export function iLikeTurtles<TType>(
        _documentNode: DocumentNode<TType, any>,
        fragmentType: FragmentType<DocumentNode<TType, any>>
      ): TType {
        return fragmentType as any
      }
      "
      `);

      expect(result[0].content).toBeSimilarStringTo(`
      export function iLikeTurtles<TType>(
        _documentNode: DocumentNode<TType, any>,
        fragmentType: FragmentType<DocumentNode<TType, any>>
      ): TType {
        return fragmentType as any
      }
      `);
    });
  });

  it('fragmentMasking.augmentedModuleName', async () => {
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
        out1: {
          preset,
          plugins: [],
          presetConfig: {
            fragmentMasking: {
              augmentedModuleName: '@urql/fragment',
            },
          },
        },
      },
    });

    expect(result).toHaveLength(4);
    expect(result[0].filename).toEqual('out1/fragment-masking.d.ts');
    expect(result[0].content).toMatchSnapshot(`
    "import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

    declare module \\"@urql/fragment\\" {
    export type FragmentType<TDocumentType extends DocumentNode<any, any>> = TDocumentType extends DocumentNode<
      infer TType,
      any
    >
      ? TType extends { ' $fragmentName': infer TKey }
        ? TKey extends string
          ? { ' $fragmentRefs': { [key in TKey]: TType } }
          : never
        : never
      : never;

    export function useFragment<TType>(
      _documentNode: DocumentNode<TType, any>,
      fragmentType: FragmentType<DocumentNode<TType, any>>
    ): TType
    }"
    `);
  });
});
