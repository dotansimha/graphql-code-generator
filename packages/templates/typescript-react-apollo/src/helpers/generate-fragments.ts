import { DepGraph } from 'dependency-graph';

import { gql, extractFragments } from './gql';
import { Fragment } from 'graphql-codegen-core';

export function generateFragments(fragments: Fragment[], options: Handlebars.HelperOptions): string {
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
      const config = options.data.root.config || {};

      if (config.noNamespaces) {
        return `
        export const ${fragment.name}Document = ${gql(fragment, options)};
        `;
      } else {
        return `
          export namespace ${fragment.name} {
            export const Document = ${gql(fragment, options)};
          }
        `;
      }
    } else {
      if (fragment.document !== cached.document) {
        throw new Error(`Duplicated fragment called '${fragment.name}'`);
      }
    }
  }
}
