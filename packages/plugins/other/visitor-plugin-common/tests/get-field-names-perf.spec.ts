import { Kind, parse } from 'graphql';
import { LoadedFragment } from '../src/types';
import { getFieldNames } from '../src/utils';

describe('getFieldNames (issue #10940)', () => {
  it('does not re-walk a fragment subtree once per spread', () => {
    // Build a chain of fragments where each fragment spreads the previous one
    // twice. There is only a single real field (`field0`) in the whole
    // document, reachable through DEPTH nested "diamond" fragment spreads.
    //
    // If a fragment's field names are recomputed from scratch on every spread
    // (instead of being computed once per fragment and reused), the amount of
    // work doubles at every level: a document with DEPTH+1 fragments and one
    // field ends up doing O(2^DEPTH) work instead of O(DEPTH). This is the
    // "M^N" fragment-reuse blow-up reported in
    // https://github.com/dotansimha/graphql-code-generator/issues/10940
    // (and, before it, https://github.com/dotansimha/graphql-code-generator-community/issues/752).
    const DEPTH = 20;

    let fragments = `fragment Frag0 on Query { field0 }\n`;
    for (let i = 1; i <= DEPTH; i++) {
      fragments += `fragment Frag${i} on Query { ...Frag${i - 1}\n...Frag${i - 1} }\n`;
    }
    const documentStr = `${fragments}\nquery Test { ...Frag${DEPTH} }`;

    const document = parse(documentStr);
    const loadedFragments: LoadedFragment[] = document.definitions
      .filter(d => d.kind === Kind.FRAGMENT_DEFINITION)
      .map(node => ({
        name: node.name.value,
        onType: node.typeCondition.name.value,
        node,
        isExternal: false,
      }));

    const operation = document.definitions.find(d => d.kind === Kind.OPERATION_DEFINITION);

    // Count how many times a field actually gets recorded. Since the whole
    // document only ever contains one real field (`field0`), this count is a
    // direct measure of how many times its containing fragment's subtree was
    // walked from scratch.
    let addCalls = 0;
    const originalAdd = Set.prototype.add;
    Set.prototype.add = function (this: Set<unknown>, value: unknown) {
      addCalls++;
      return originalAdd.call(this, value);
    };

    try {
      const fieldNames = getFieldNames({
        selections: operation.selectionSet.selections,
        loadedFragments,
      });

      expect(fieldNames.size).toBe(1);
      expect([...fieldNames]).toEqual(['field0']);

      // With DEPTH=20 "diamond" spreads, an implementation that re-walks a
      // fragment's subtree on every spread performs 2^20 (1,048,576) calls
      // to add `field0`. An implementation that computes a fragment's field
      // names once and reuses them stays close to linear in DEPTH.
      expect(addCalls).toBeLessThan(1000);
    } finally {
      Set.prototype.add = originalAdd;
    }
  });
});
