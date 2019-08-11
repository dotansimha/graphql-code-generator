import { DocumentNode, visit, FieldNode, Kind } from 'graphql';

export function isUsingTypes(document: DocumentNode): boolean {
  let foundFields = 0;

  visit(document, {
    enter: {
      Field: (node: FieldNode) => {
        const selections = node.selectionSet ? node.selectionSet.selections || [] : [];

        if (selections.length === 0 || selections[0].kind === Kind.FRAGMENT_SPREAD) {
          foundFields++;
        }
      },
    },
  });

  return foundFields > 0;
}
