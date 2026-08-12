import path from 'path';
import { executeCodegen } from '@graphql-codegen/cli';
import { preset } from '../src/index.js';

describe('client-preset - fragment masking', () => {
  it('fragmentMasking: false', async () => {
    const { result } = await executeCodegen({
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
    const { result } = await executeCodegen({
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
    const { result } = await executeCodegen({
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
    const { result } = await executeCodegen({
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

    const fragmentFile = result.find(file => file.filename.includes('fragment-masking.ts'));

    expect(fragmentFile.content).toMatchInlineSnapshot(`
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
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>>
      ): TType;
      // return nullable if \`fragmentType\` is undefined
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | undefined
      ): TType | undefined;
      // return nullable if \`fragmentType\` is nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null
      ): TType | null;
      // return nullable if \`fragmentType\` is nullable or undefined
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null | undefined
      ): TType | null | undefined;
      // return array of non-nullable if \`fragmentType\` is array of non-nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>>
      ): Array<TType>;
      // return array of nullable if \`fragmentType\` is array of nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
      ): Array<TType> | null | undefined;
      // return readonly array of non-nullable if \`fragmentType\` is array of non-nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>>
      ): ReadonlyArray<TType>;
      // return readonly array of nullable if \`fragmentType\` is array of nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
      ): ReadonlyArray<TType> | null | undefined;
      export function useFragment<TType>(
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

    // FIXME(pnpm-update): TypeScript errors. Maybe content shouldn't be merged?
    // const content = mergeOutputs([
    //   ...result,
    //   fs.readFileSync(docPath, 'utf8'),
    //   `
    //   function App(props: { data: FooQuery }) {
    //     const fragment: FooFragment | null | undefined = useFragment(Fragment, props.data.foo);
    //     return fragment == null ? "no data" : fragment.value;
    //   }
    //   `,
    // ]);
    // validateTs(content, undefined, false, true, [`Duplicate identifier 'DocumentNode'.`], true);
  });

  it('can accept list in useFragment', async () => {
    const docPath = path.join(__dirname, 'fixtures/with-fragment.ts');
    const { result } = await executeCodegen({
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

    const fragmentFile = result.find(file => file.filename.includes('fragment-masking.ts'));

    expect(fragmentFile.content).toMatchInlineSnapshot(`
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
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>>
      ): TType;
      // return nullable if \`fragmentType\` is undefined
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | undefined
      ): TType | undefined;
      // return nullable if \`fragmentType\` is nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null
      ): TType | null;
      // return nullable if \`fragmentType\` is nullable or undefined
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null | undefined
      ): TType | null | undefined;
      // return array of non-nullable if \`fragmentType\` is array of non-nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>>
      ): Array<TType>;
      // return array of nullable if \`fragmentType\` is array of nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
      ): Array<TType> | null | undefined;
      // return readonly array of non-nullable if \`fragmentType\` is array of non-nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>>
      ): ReadonlyArray<TType>;
      // return readonly array of nullable if \`fragmentType\` is array of nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
      ): ReadonlyArray<TType> | null | undefined;
      export function useFragment<TType>(
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

    // FIXME(pnpm-update): TypeScript errors. Maybe content shouldn't be merged?
    // const content = mergeOutputs([
    //   ...result,
    //   fs.readFileSync(docPath, 'utf8'),
    //   `
    //   function App(props: { foos: Array<FragmentType<typeof Fragment>> }) {
    //     const fragments: Array<FooFragment> = useFragment(Fragment, props.foos);
    //     return fragments.map(f => f.value);
    //   }
    //   `,
    // ]);
    // validateTs(content, undefined, false, true, [`Duplicate identifier 'DocumentNode'.`], true);
  });

  it('useFragment preserves ReadonlyArray<T> type', async () => {
    const docPath = path.join(__dirname, 'fixtures/with-fragment.ts');
    const { result } = await executeCodegen({
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

    const fragmentFile = result.find(file => file.filename.includes('fragment-masking.ts'));

    expect(fragmentFile.content).toMatchInlineSnapshot(`
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
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>>
      ): TType;
      // return nullable if \`fragmentType\` is undefined
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | undefined
      ): TType | undefined;
      // return nullable if \`fragmentType\` is nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null
      ): TType | null;
      // return nullable if \`fragmentType\` is nullable or undefined
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null | undefined
      ): TType | null | undefined;
      // return array of non-nullable if \`fragmentType\` is array of non-nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>>
      ): Array<TType>;
      // return array of nullable if \`fragmentType\` is array of nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
      ): Array<TType> | null | undefined;
      // return readonly array of non-nullable if \`fragmentType\` is array of non-nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>>
      ): ReadonlyArray<TType>;
      // return readonly array of nullable if \`fragmentType\` is array of nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
      ): ReadonlyArray<TType> | null | undefined;
      export function useFragment<TType>(
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

    // FIXME(pnpm-update): TypeScript errors. Maybe content shouldn't be merged?
    // const content = mergeOutputs([
    //   ...result,
    //   fs.readFileSync(docPath, 'utf8'),
    //   `
    //   function App(props: { data: FoosQuery }) {
    //     const fragments: ReadonlyArray<FooFragment> | null | undefined = useFragment(Fragment, props.data.foos);
    //     return fragments == null ? "no data" : fragments.map(f => f.value);
    //   }
    //   `,
    // ]);
    // validateTs(content, undefined, false, true, [`Duplicate identifier 'DocumentNode'.`], true);
  });

  it('#10896 - reserves fragmentMasking=true behaviour, even when used with conditional directives @include/@skip', async () => {
    const schema = /* GraphQL */ `
      type Query {
        user: User
      }
      type User {
        id: ID!
        nicknames: [String!]
        age: Int
      }
    `;
    const document = /* GraphQL */ `
      query GetUser($withNicknames: Boolean!) {
        user {
          id
          ...UserNicknames @include(if: true)
          ... on User @include(if: true) {
            age
          }
        }
      }
      fragment UserNicknames on User {
        nicknames
      }
    `;
    const { result } = await executeCodegen({
      schema,
      documents: document,
      generates: {
        'out1/': {
          preset,
          presetConfig: {
            fragmentMasking: true,
          },
        },
      },
    });

    expect(result).toHaveLength(4);

    const typeFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(typeFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      /** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      export type GetUserQueryVariables = Exact<{
        withNicknames: boolean;
      }>;


      export type GetUserQuery = { user: { id: string } & { age?: number | null } & { ' $fragmentRefs'?: { 'UserNicknamesFragment': UserNicknamesFragment } } | null };

      export type UserNicknamesFragment = { nicknames: Array<string> | null } & { ' $fragmentName'?: 'UserNicknamesFragment' };

      export const UserNicknamesFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserNicknames"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nicknames"}}]}}]} as unknown as DocumentNode<UserNicknamesFragment, unknown>;
      export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withNicknames"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserNicknames"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"BooleanValue","value":true}}]}]},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"BooleanValue","value":true}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"age"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserNicknames"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nicknames"}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;"
    `);
    const fragmentMaskingFile = result.find(file => file.filename === 'out1/fragment-masking.ts');
    expect(fragmentMaskingFile.content).toMatchInlineSnapshot(`
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
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>>
      ): TType;
      // return nullable if \`fragmentType\` is undefined
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | undefined
      ): TType | undefined;
      // return nullable if \`fragmentType\` is nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null
      ): TType | null;
      // return nullable if \`fragmentType\` is nullable or undefined
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null | undefined
      ): TType | null | undefined;
      // return array of non-nullable if \`fragmentType\` is array of non-nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>>
      ): Array<TType>;
      // return array of nullable if \`fragmentType\` is array of nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
      ): Array<TType> | null | undefined;
      // return readonly array of non-nullable if \`fragmentType\` is array of non-nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>>
      ): ReadonlyArray<TType>;
      // return readonly array of nullable if \`fragmentType\` is array of nullable
      export function useFragment<TType>(
        _documentNode: DocumentTypeDecoration<TType, any>,
        fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
      ): ReadonlyArray<TType> | null | undefined;
      export function useFragment<TType>(
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

    const indexFile = result.find(file => file.filename === 'out1/index.ts');
    expect(indexFile.content).toMatchInlineSnapshot(`
      "export * from "./fragment-masking";
      export * from "./gql";"
    `);

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
          "query GetUser($withNicknames: Boolean!) {\\n  user {\\n    id\\n    ...UserNicknames @include(if: true)\\n    ... on User @include(if: true) {\\n      age\\n    }\\n  }\\n}\\n\\nfragment UserNicknames on User {\\n  nicknames\\n}": typeof types.GetUserDocument,
      };
      const documents: Documents = {
          "query GetUser($withNicknames: Boolean!) {\\n  user {\\n    id\\n    ...UserNicknames @include(if: true)\\n    ... on User @include(if: true) {\\n      age\\n    }\\n  }\\n}\\n\\nfragment UserNicknames on User {\\n  nicknames\\n}": types.GetUserDocument,
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
      export function graphql(source: "query GetUser($withNicknames: Boolean!) {\\n  user {\\n    id\\n    ...UserNicknames @include(if: true)\\n    ... on User @include(if: true) {\\n      age\\n    }\\n  }\\n}\\n\\nfragment UserNicknames on User {\\n  nicknames\\n}"): (typeof documents)["query GetUser($withNicknames: Boolean!) {\\n  user {\\n    id\\n    ...UserNicknames @include(if: true)\\n    ... on User @include(if: true) {\\n      age\\n    }\\n  }\\n}\\n\\nfragment UserNicknames on User {\\n  nicknames\\n}"];

      export function graphql(source: string) {
        return (documents as any)[source] ?? {};
      }

      export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;"
    `);
  });

  it('inline fragment in union with conditional directives must make inline fragment fields optional', async () => {
    const schema = /* GraphQL */ `
      type Mutation {
        doSomething: DoSomethingPayload!
        doAnother: DoAnotherPayload!
      }

      union DoSomethingPayload =
        | SystemError
        | SystemSuccess
        | ClientError
        | ClientMissingServiceError
        | ClientMissingUrlError
        | ClientRetry
        | ClientSuccess

      type SystemError {
        message: String!
      }

      type SystemSuccess {
        message: String!
      }

      type ClientError {
        changes: ChangeConnection
        errors: ErrorConnection
        linkToWebsite: String
        valid: Boolean!
      }

      type ClientMissingServiceError {
        message: String!
      }

      type ClientMissingUrlError {
        message: String!
      }

      type ClientRetry {
        reason: String!
      }

      type ClientSuccess {
        changes: ChangeConnection
        initial: Boolean!
        linkToWebsite: String
        message: String
        valid: Boolean!
      }

      union DoAnotherPayload = DoAnotherSuccess | DoAnotherError

      type DoAnotherSuccess {
        changes: ChangeConnection
      }
      type DoAnotherError {
        errors: ErrorConnection!
      }

      type ChangeConnection {
        edges: [ChangeEdge!]!
      }
      type ChangeEdge {
        cursor: String!
        node: ChangeNode!
      }
      type ChangeNode {
        value: String
      }

      type ErrorConnection {
        edges: [ErrorEdge!]!
      }
      type ErrorEdge {
        cursor: String!
        node: ErrorNode!
      }
      type ErrorNode {
        message: String!
      }
    `;
    const document = /* GraphQL */ `
      mutation Test($skip: Boolean!) {
        doSomething {
          __typename
          ... on ClientSuccess @skip(if: $skip) {
            initial
            valid
            successMessage: message
            linkToWebsite
            changes {
              edges {
                __typename
              }
              ...Changes
            }
          }
          ... on ClientError @skip(if: $skip) {
            valid
            linkToWebsite
            changes {
              edges {
                __typename
              }
              ...Changes
            }
            errors {
              ...Errors
            }
          }
          ... on ClientMissingServiceError @skip(if: $skip) {
            missingServiceError: message
          }
          ... on ClientMissingUrlError @skip(if: $skip) {
            missingUrlError: message
          }
          ... on SystemSuccess @include(if: $skip) {
            message
          }
          ... on SystemError @include(if: $skip) {
            message
          }
          ... on ClientRetry {
            reason
          }
        }

        doAnother {
          __typename
          ... on DoAnotherSuccess {
            changes {
              edges {
                __typename
              }
              ...Changes
            }
          }
          ... on DoAnotherError {
            errors {
              ...Errors
            }
          }
        }
      }

      fragment Changes on ChangeConnection {
        edges {
          node {
            value
          }
        }
      }

      fragment Errors on ErrorConnection {
        edges {
          node {
            message
          }
        }
      }
    `;
    const { result } = await executeCodegen({
      schema,
      documents: document,
      generates: {
        'out1/': {
          preset,
        },
      },
    });

    const typeFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(typeFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      /** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      export type TestMutationVariables = Exact<{
        skip: boolean;
      }>;


      export type TestMutation = { doSomething:
          | { __typename: 'ClientError' } & { valid?: boolean, linkToWebsite?: string | null, changes?: (
              { edges: Array<{ __typename: 'ChangeEdge' }> }
              & { ' $fragmentRefs'?: { 'ChangesFragment': ChangesFragment } }
            ) | null, errors?: { ' $fragmentRefs'?: { 'ErrorsFragment': ErrorsFragment } } | null }
          | { __typename: 'ClientMissingServiceError' } & { missingServiceError?: string }
          | { __typename: 'ClientMissingUrlError' } & { missingUrlError?: string }
          | { __typename: 'ClientRetry', reason: string }
          | { __typename: 'ClientSuccess' } & { initial?: boolean, valid?: boolean, linkToWebsite?: string | null, successMessage?: string | null, changes?: (
              { edges: Array<{ __typename: 'ChangeEdge' }> }
              & { ' $fragmentRefs'?: { 'ChangesFragment': ChangesFragment } }
            ) | null }
          | { __typename: 'SystemError' } & { message?: string }
          | { __typename: 'SystemSuccess' } & { message?: string }
        , doAnother:
          | { __typename: 'DoAnotherError', errors: { ' $fragmentRefs'?: { 'ErrorsFragment': ErrorsFragment } } }
          | { __typename: 'DoAnotherSuccess', changes: (
              { edges: Array<{ __typename: 'ChangeEdge' }> }
              & { ' $fragmentRefs'?: { 'ChangesFragment': ChangesFragment } }
            ) | null }
         };

      export type ChangesFragment = { edges: Array<{ node: { value: string | null } }> } & { ' $fragmentName'?: 'ChangesFragment' };

      export type ErrorsFragment = { edges: Array<{ node: { message: string } }> } & { ' $fragmentName'?: 'ErrorsFragment' };

      export const ChangesFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Changes"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<ChangesFragment, unknown>;
      export const ErrorsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Errors"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ErrorConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<ErrorsFragment, unknown>;
      export const TestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Test"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"doSomething"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ClientSuccess"}},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initial"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","alias":{"kind":"Name","value":"successMessage"},"name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"linkToWebsite"}},{"kind":"Field","name":{"kind":"Name","value":"changes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Changes"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ClientError"}},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"linkToWebsite"}},{"kind":"Field","name":{"kind":"Name","value":"changes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Changes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Errors"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ClientMissingServiceError"}},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"missingServiceError"},"name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ClientMissingUrlError"}},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"missingUrlError"},"name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SystemSuccess"}},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SystemError"}},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ClientRetry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"doAnother"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DoAnotherSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Changes"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DoAnotherError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Errors"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Changes"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Errors"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ErrorConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<TestMutation, TestMutationVariables>;"
    `);
  });
});
