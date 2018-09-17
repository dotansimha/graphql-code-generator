import { DocumentNode, DirectiveNode } from 'graphql';

import { checkDocument, removeDirectivesFromDocument } from 'apollo-utilities';

export function removeDirective(name: string) {
  const config = {
    test: (directive: DirectiveNode) => directive.name.value === name,
    remove: true
  };

  return function removeClientSetsFromDocument(query: DocumentNode): DocumentNode {
    checkDocument(query);

    const doc = removeDirectivesFromDocument([config], query);

    return doc;
  };
}
