import { buildSchema, parse } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin, TypeScriptDocumentsPluginConfig } from '../src/index.js';

describe('TypeScript Operations Plugin - external fragment imports', () => {
  it('Issue #10922 - importSchemaTypesFrom with inlineFragmentTypes=combine - does not import Types when a document only spreads a fragment, with no direct reference to an enum type', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        book: Book
      }

      type Book {
        id: ID!
        category: Category!
      }

      type Category {
        id: ID!
        kind: CategoryKind!
      }

      enum CategoryKind {
        FICTION
        NON_FICTION
      }
    `);

    // Fragment defined in its own file, selecting the enum field directly.
    const categoryFragmentDocument = parse(/* GraphQL */ `
      fragment Category on Category {
        id
        kind
      }
    `);

    // Fragment defined in a separate file, which only spreads the fragment above
    // and never names the enum (or any other schema type) itself.
    const bookFragmentDocument = parse(/* GraphQL */ `
      fragment Book on Book {
        id
        category {
          ...Category
        }
      }
    `);

    const categoryFragmentDef = categoryFragmentDocument.definitions[0];
    if (categoryFragmentDef.kind !== 'FragmentDefinition') {
      throw new Error('Expected fragment definition');
    }

    const config: TypeScriptDocumentsPluginConfig = {
      inlineFragmentTypes: 'combine',
      importSchemaTypesFrom: './types',
      namespacedImportName: 'Types',
    };

    // category.generated.ts: selects `kind` directly, so it correctly imports `Types`
    // and references `Types.CategoryKind`.
    const categoryResult = mergeOutputs([
      await plugin(schema, [{ document: categoryFragmentDocument }], config, {
        outputFile: './category.generated.ts',
      }),
    ]);

    expect(categoryResult).toMatchInlineSnapshot(`
      "import type * as Types from './types';


      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type CategoryFragment = { id: string, kind: Types.CategoryKind };
      "
    `);
    validateTs(categoryResult, undefined, undefined, undefined, undefined, true);

    // book.generated.ts: only spreads `...Category`, so the generated type merely
    // references `CategoryFragment` - it never names `Types` and must not import it.
    const bookResult = mergeOutputs([
      await plugin(
        schema,
        [{ document: bookFragmentDocument }],
        {
          ...config,
          externalFragments: [
            {
              node: categoryFragmentDef,
              name: 'Category',
              onType: 'Category',
              isExternal: true,
            },
          ],
        },
        { outputFile: './book.generated.ts' },
      ),
    ]);

    expect(bookResult).toMatchInlineSnapshot(`
      "
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type BookFragment = { id: string, category: CategoryFragment };
      "
    `);
  });
});
