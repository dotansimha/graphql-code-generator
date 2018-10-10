import { DepGraph } from 'dependency-graph';

import { toFragmentName } from './to-fragment-name';
import { gql, extractFragments } from './gql';

export function generateFragments(fragments: any[], options: any): string {
  const cachedFragments: Record<string, any> = {};

  if (!fragments) {
    return '';
  }

  const graph = new DepGraph({ circular: true });

  fragments.forEach(fragment => {
    graph.addNode(fragment.name, fragment);
  });

  fragments.forEach(fragment => {
    const depends = extractFragments(fragment.document);

    if (depends) {
      depends.forEach(name => {
        graph.addDependency(fragment.name, name);
      });
    }
  });

  return graph
    .overallOrder()
    .map(name => generateFragment(graph.getNodeData(name), options))
    .join('\n');

  function generateFragment(fragment: any, options: any): string | void {
    const cached = cachedFragments[fragment.name];

    if (!cached) {
      cachedFragments[fragment.name] = fragment;

      return `
          export const ${toFragmentName(fragment.name)} = ${gql(fragment, options)};
      `;
    } else {
      if (fragment.document !== cached.document) {
        throw new Error(`Duplicated fragment called '${fragment.name}'`);
      }
    }
  }
}
