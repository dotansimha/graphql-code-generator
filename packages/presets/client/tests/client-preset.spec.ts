import { executeCodegen } from '@graphql-codegen/cli';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import '@graphql-codegen/testing';
import { validateTs } from '@graphql-codegen/testing';
import * as fs from 'fs';
import path from 'path';
import { preset } from '../src/index.js';
import { isOutputFolder } from '../src/isOutputFolder.js';

jest.mock('../src/isOutputFolder.js');

describe('client-preset', () => {
  beforeEach(() => {
    jest.mocked(isOutputFolder).mockReturnValue(true);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
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

    expect(result).toHaveLength(4);
    // index.ts (re-exports)
    const indexFile = result.find(file => file.filename === 'out1/index.ts');
    expect(indexFile.content).toEqual(`export * from "./gql"
export * from "./fragment-masking"`);

    // gql.ts
    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as types from './graphql';
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      const documents = {
          "\\n  query A {\\n    a\\n  }\\n": types.ADocument,
          "\\n  query B {\\n    b\\n  }\\n": types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
      };

      export function graphql(source: "\\n  query A {\\n    a\\n  }\\n"): (typeof documents)["\\n  query A {\\n    a\\n  }\\n"];
      export function graphql(source: "\\n  query B {\\n    b\\n  }\\n"): (typeof documents)["\\n  query B {\\n    b\\n  }\\n"];
      export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

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

    expect(result).toHaveLength(4);
    // index.ts (re-exports)
    const indexFile = result.find(file => file.filename === 'out1/index.ts');
    expect(indexFile.content).toEqual(`export * from "./gql"
export * from "./fragment-masking"`);

    // gql.ts
    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as types from './graphql';
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      const documents = {
          "\\n  query a {\\n    a\\n  }\\n": types.ADocument,
          "\\n  query b {\\n    b\\n  }\\n": types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
      };

      export function graphql(source: "\\n  query a {\\n    a\\n  }\\n"): (typeof documents)["\\n  query a {\\n    a\\n  }\\n"];
      export function graphql(source: "\\n  query b {\\n    b\\n  }\\n"): (typeof documents)["\\n  query b {\\n    b\\n  }\\n"];
      export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

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
        out1: {
          preset,
          plugins: [],
        },
      },
    });
    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as types from './graphql';
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      const documents = {
          "\\n  query a {\\n    a\\n  }\\n": types.ADocument,
          "\\n  query b {\\n    b\\n  }\\n": types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
      };

      export function graphql(source: "\\n  query a {\\n    a\\n  }\\n"): (typeof documents)["\\n  query a {\\n    a\\n  }\\n"];
      export function graphql(source: "\\n  query b {\\n    b\\n  }\\n"): (typeof documents)["\\n  query b {\\n    b\\n  }\\n"];
      export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

      export function graphql(source: string): unknown;
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
        out1: {
          preset,
          plugins: [],
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

      const documents = {
          "\\n  query A {\\n    a\\n  }\\n": types.ADocument,
          "\\n  query B {\\n    b\\n  }\\n": types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
      };

      export function graphql(source: "\\n  query A {\\n    a\\n  }\\n"): (typeof documents)["\\n  query A {\\n    a\\n  }\\n"];
      export function graphql(source: "\\n  query B {\\n    b\\n  }\\n"): (typeof documents)["\\n  query B {\\n    b\\n  }\\n"];
      export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

      export function graphql(source: string): unknown;
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

      export type CFragment = { __typename?: 'Query', c?: string | null } & { ' $fragmentName': 'CFragment' };

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
        out1: {
          preset,
          plugins: [],
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

      const documents = {
          "\\n  query a {\\n    a\\n  }\\n": types.ADocument,
      };

      export function graphql(source: "\\n  query a {\\n    a\\n  }\\n"): (typeof documents)["\\n  query a {\\n    a\\n  }\\n"];

      export function graphql(source: string): unknown;
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


      export const ADocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"a"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"a"}}]}}]} as unknown as DocumentNode<AQuery, AQueryVariables>;"
    `);

    expect(gqlFile.content.match(/query a {/g).length).toBe(3);
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
          out1: {
            preset,
            plugins: [],
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
      expect(indexFile.content).toMatchInlineSnapshot(`"export * from "./gql""`);
      const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
      expect(gqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import * as types from './graphql';
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

        const documents = {
            "\\n  query A {\\n    a\\n  }\\n": types.ADocument,
            "\\n  query B {\\n    b\\n  }\\n": types.BDocument,
            "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
        };

        export function graphql(source: "\\n  query A {\\n    a\\n  }\\n"): (typeof documents)["\\n  query A {\\n    a\\n  }\\n"];
        export function graphql(source: "\\n  query B {\\n    b\\n  }\\n"): (typeof documents)["\\n  query B {\\n    b\\n  }\\n"];
        export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

        export function graphql(source: string): unknown;
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
          out1: {
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
          out1: {
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
      const gqlFile = result.find(file => file.filename === 'out1/fragment-masking.ts');
      expect(gqlFile.content).toMatchInlineSnapshot(`
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

        // return non-nullable if \`fragmentType\` is non-nullable
        export function iLikeTurtles<TType>(
          _documentNode: DocumentNode<TType, any>,
          fragmentType: FragmentType<DocumentNode<TType, any>>
        ): TType;
        // return nullable if \`fragmentType\` is nullable
        export function iLikeTurtles<TType>(
          _documentNode: DocumentNode<TType, any>,
          fragmentType: FragmentType<DocumentNode<TType, any>> | null | undefined
        ): TType | null | undefined;
        // return array of non-nullable if \`fragmentType\` is array of non-nullable
        export function iLikeTurtles<TType>(
          _documentNode: DocumentNode<TType, any>,
          fragmentType: ReadonlyArray<FragmentType<DocumentNode<TType, any>>>
        ): ReadonlyArray<TType>;
        // return array of nullable if \`fragmentType\` is array of nullable
        export function iLikeTurtles<TType>(
          _documentNode: DocumentNode<TType, any>,
          fragmentType: ReadonlyArray<FragmentType<DocumentNode<TType, any>>> | null | undefined
        ): ReadonlyArray<TType> | null | undefined
        export function iLikeTurtles<TType>(
          _documentNode: DocumentNode<TType, any>,
          fragmentType: FragmentType<DocumentNode<TType, any>> | ReadonlyArray<FragmentType<DocumentNode<TType, any>>> | null | undefined
        ): TType | ReadonlyArray<TType> | null | undefined {
          return fragmentType as any
        }
        "
      `);

      expect(gqlFile.content).toBeSimilarStringTo(`
      export function iLikeTurtles<TType>(
        _documentNode: DocumentNode<TType, any>,
        fragmentType: FragmentType<DocumentNode<TType, any>>
      ): TType;
      `);
      expect(gqlFile.content).toBeSimilarStringTo(`
      export function iLikeTurtles<TType>(
        _documentNode: DocumentNode<TType, any>,
        fragmentType: FragmentType<DocumentNode<TType, any>> | null | undefined
      ): TType | null | undefined;
      `);
      expect(gqlFile.content).toBeSimilarStringTo(`
      export function iLikeTurtles<TType>(
        _documentNode: DocumentNode<TType, any>,
        fragmentType: ReadonlyArray<FragmentType<DocumentNode<TType, any>>>
      ): ReadonlyArray<TType>;
      `);
      expect(gqlFile.content).toBeSimilarStringTo(`
      export function iLikeTurtles<TType>(
        _documentNode: DocumentNode<TType, any>,
        fragmentType: ReadonlyArray<FragmentType<DocumentNode<TType, any>>> | null | undefined
      ): ReadonlyArray<TType> | null | undefined
      `);
      expect(gqlFile.content).toBeSimilarStringTo(`
      export function iLikeTurtles<TType>(
        _documentNode: DocumentNode<TType, any>,
        fragmentType: FragmentType<DocumentNode<TType, any>> | ReadonlyArray<FragmentType<DocumentNode<TType, any>>> | null | undefined
      ): TType | ReadonlyArray<TType> | null | undefined {
        return fragmentType as any
      }
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
          out1: {
            preset,
            plugins: [],
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
          out1: {
            preset,
            plugins: [],
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
        out1: {
          preset,
          plugins: [],
        },
      },
      emitLegacyCommonJSImports: false,
    });

    expect(result).toHaveLength(4);
    // index.ts (re-exports)
    const indexFile = result.find(file => file.filename === 'out1/index.ts');
    expect(indexFile.content).toEqual(`export * from "./gql.js"
export * from "./fragment-masking.js"`);

    // gql.ts
    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import * as types from './graphql.js';
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

      const documents = {
          "\\n  query A {\\n    a\\n  }\\n": types.ADocument,
          "\\n  query B {\\n    b\\n  }\\n": types.BDocument,
          "\\n  fragment C on Query {\\n    c\\n  }\\n": types.CFragmentDoc,
      };

      export function graphql(source: "\\n  query A {\\n    a\\n  }\\n"): (typeof documents)["\\n  query A {\\n    a\\n  }\\n"];
      export function graphql(source: "\\n  query B {\\n    b\\n  }\\n"): (typeof documents)["\\n  query B {\\n    b\\n  }\\n"];
      export function graphql(source: "\\n  fragment C on Query {\\n    c\\n  }\\n"): (typeof documents)["\\n  fragment C on Query {\\n    c\\n  }\\n"];

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
          out1: {
            preset,
            plugins: [],
          },
        },
        emitLegacyCommonJSImports: false,
      });

      expect(result).toHaveLength(4);
      // index.ts (re-exports)
      const indexFile = result.find(file => file.filename === 'out1/index.ts');
      expect(indexFile.content).toEqual(`export * from "./gql.js"
export * from "./fragment-masking.js"`);

      // gql.ts
      const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
      expect(gqlFile.content).toMatchInlineSnapshot(`
        "/* eslint-disable */
        import * as types from './graphql.js';
        import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

        const documents = [];
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
});
