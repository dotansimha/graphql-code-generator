import { Kind, visit } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';

/**
 * Automatically adds `__typename` selections to every object type in your GraphQL document.
 * This is useful for GraphQL Clients such as Apollo Client or urql that need typename information for their cache to function.
 */
export const addTypenameSelectionDocumentTransform: Types.DocumentTransformObject = {
  transform({ documents }) {
    return documents.map(document => ({
      ...document,
      document: document.document
        ? visit(document.document, {
            SelectionSet(node) {
              if (
                !node.selections.find(selection => selection.kind === 'Field' && selection.name.value === '__typename')
              ) {
                return {
                  ...node,
                  selections: [
                    {
                      kind: Kind.FIELD,
                      name: {
                        kind: Kind.NAME,
                        value: '__typename',
                      },
                    },
                    ...node.selections,
                  ],
                };
              }
              return undefined;
            },
          })
        : undefined,
    }));
  },
};
