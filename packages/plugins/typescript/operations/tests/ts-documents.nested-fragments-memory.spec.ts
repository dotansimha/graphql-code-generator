import { buildSchema, parse, print } from 'graphql';
import { selectionSetCacheKeys } from '@graphql-codegen/visitor-plugin-common';
import { plugin } from '../src/index.js';

const schema = buildSchema(/* GraphQL */ `
  type Query {
    root: Node
  }

  type Node {
    id: ID!
    name: String
    a: Node
    b: Node
    c: Node
  }
`);

// A chain of fragments F0..F(DEPTH-1), where each fragment spreads the previous one under several fields.
// The document as written is linear in DEPTH, but its fragment-expanded tree is 3^DEPTH in size.
const DEPTH = 8;
const buildDocumentSource = () => {
  const fragments = [
    /* GraphQL */ `
      fragment F0 on Node {
        id
        name
      }
    `,
  ];
  for (let i = 1; i < DEPTH; i++) {
    fragments.push(/* GraphQL */ `
      fragment F${i} on Node {
        id
        a {
          ...F${i - 1}
        }
        b {
          ...F${i - 1}
        }
        c {
          ...F${i - 1}
        }
      }
    `);
  }
  return /* GraphQL */ `
    query Root {
      root {
        ...F${DEPTH - 1}
      }
    }
    ${fragments.join('\n')}
  `;
};

describe('TypeScript Operations Plugin - deeply nested fragments (issue #10940)', () => {
  it('does not retain type cache keys that grow exponentially with nested fragment reuse', async () => {
    const document = parse(buildDocumentSource());
    const printedDocumentLength = print(document).length;

    // Spy on the memo behind the type cache keys, so we can measure every key that gets built.
    const setSpy = vi.spyOn(selectionSetCacheKeys, 'set');

    let result: Awaited<ReturnType<typeof plugin>>;
    let cacheKeys: string[];
    try {
      // No config needed: each option (including every `inlineFragmentTypes` mode) was measured
      // and none changes the cache key sizes; the growth comes from nested fragment reuse alone.
      result = await plugin(
        schema,
        [{ location: 'test-file.ts', document }],
        {},
        { outputFile: 'graphql.ts' },
      );
    } finally {
      // Read the calls before restoring: `mockRestore()` also clears them.
      cacheKeys = setSpy.mock.calls.map(([, key]) => key);
      setSpy.mockRestore();
    }

    // Output is produced for both the operation and the outermost fragment.
    expect(result.content).toMatch(/export type RootQuery\b/);
    expect(result.content).toMatch(new RegExp(`export type F${DEPTH - 1}Fragment\\b`));

    // In user terms: memory retained by the type cache must scale with the documents as written,
    // not with the fragment-expanded tree. Otherwise it grows exponentially with nested fragment
    // reuse, and large projects with deeply nested, widely reused fragments run out of memory.
    // Guard against the spy silently seeing nothing, which would make the bounds below pass vacuously.
    expect(cacheKeys.length).toBeGreaterThan(0);

    const bound = 10 * printedDocumentLength;
    expect(Math.max(...cacheKeys.map(key => key.length))).toBeLessThan(bound);
    expect(cacheKeys.reduce((total, key) => total + key.length, 0)).toBeLessThan(bound);
  });
});
