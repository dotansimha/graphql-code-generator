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
});
