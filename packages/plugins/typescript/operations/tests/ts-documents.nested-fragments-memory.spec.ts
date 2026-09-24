import { buildSchema, parse, print } from 'graphql';
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

    // Instrument Map#set to measure the cache keys stored in the selection-set processor's `typeCache`
    // (its inner maps are keyed by `<field selections> @ <possible types>` strings).
    let retainedCacheKeyLength = 0;
    let longestCacheKey = 0;
    const originalSet = Map.prototype.set;
    const setSpy = vi.spyOn(Map.prototype, 'set').mockImplementation(function (
      this: Map<unknown, unknown>,
      key,
      value,
    ) {
      if (
        typeof key === 'string' &&
        key.includes(' @ ') &&
        Array.isArray(value) &&
        value.length === 2
      ) {
        retainedCacheKeyLength += key.length;
        longestCacheKey = Math.max(longestCacheKey, key.length);
      }
      return originalSet.call(this, key, value);
    });

    let result: Awaited<ReturnType<typeof plugin>>;
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
      setSpy.mockRestore();
    }

    // Output is produced for both the operation and the outermost fragment.
    expect(result.content).toMatch(/export type RootQuery\b/);
    expect(result.content).toMatch(new RegExp(`export type F${DEPTH - 1}Fragment\\b`));

    // In user terms: memory retained by the type cache must scale with the documents as written,
    // not with the fragment-expanded tree. Otherwise it grows exponentially with nested fragment
    // reuse, and large projects with deeply nested, widely reused fragments run out of memory.
    const bound = 10 * printedDocumentLength;
    expect(longestCacheKey).toBeLessThan(bound);
    expect(retainedCacheKeyLength).toBeLessThan(bound);
  });
});
