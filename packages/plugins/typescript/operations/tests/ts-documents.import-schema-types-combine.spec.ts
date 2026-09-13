import { buildSchema, parse } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - importSchemaTypesFrom with inlineFragmentTypes: "combine"', () => {
  // https://github.com/dotansimha/graphql-code-generator/issues/10922
  it('does not emit an unused schema-types import when a document only spreads a fragment that itself uses a schema type', async () => {
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

    const config = {
      // Fragment types are referenced, not inlined - this is what makes the bug
      // observable: `BookFragment` never names `Types` itself, it only references
      // `CategoryFragment`.
      inlineFragmentTypes: 'combine' as const,
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

    expect(categoryResult).toContain("import type * as Types from './types';");
    expect(categoryResult).toContain('Types.CategoryKind');
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

    expect(bookResult).toContain('category: CategoryFragment');
    expect(bookResult).not.toContain('Types');
  });
});
