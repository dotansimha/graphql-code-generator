import { ASTNode, OperationDefinitionNode, Kind, visit } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';

/**
 * Automatically adds `__typename` selections to every object type in your GraphQL document except the root node in subscriptions since a single root field is expected (https://spec.graphql.org/draft/#sec-Single-root-field).
 * This is useful for GraphQL Clients such as Apollo Client or urql that need typename information for their cache to function.
 */
export const addTypenameSelectionDocumentTransform: Types.DocumentTransformObject = {
  transform({ documents }) {
    return documents.map(document => ({
      ...document,
      document: document.document
        ? visit(document.document, {
            SelectionSet(node, _, parent) {
              const isSubscriptionRoot = typeof((parent as ASTNode)?.kind) === 'string' &&
                (parent as ASTNode).kind === 'OperationDefinition' && (parent as OperationDefinitionNode).operation === 'subscription';
              if (
                !isSubscriptionRoot && !node.selections.find(selection => selection.kind === 'Field' && selection.name.value === '__typename')
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
