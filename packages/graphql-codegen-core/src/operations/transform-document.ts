import { DefinitionNode, DocumentNode, FragmentDefinitionNode, GraphQLSchema } from 'graphql';
import { Document } from '../types';
import { transformFragment } from './transform-fragment-document';
import { OPERATION_DEFINITION, FRAGMENT_DEFINITION } from 'graphql/language/kinds';

export function transformDocument(schema: GraphQLSchema, documentNode: DocumentNode): Document {
  const result: Document = {
    fragments: [],
    operations: [],
    hasFragments: false,
    hasOperations: false,
  };

  (documentNode.definitions || []).forEach((definitionNode: DefinitionNode) => {
    if (definitionNode.kind === OPERATION_DEFINITION) {

    } else if (definitionNode.kind === FRAGMENT_DEFINITION) {
      result.fragments.push(transformFragment(schema, definitionNode as FragmentDefinitionNode));
    } else {
      throw new Error(`Unexpected DefinitionNode sub-type: ${definitionNode.toString()}`);
    }
  });

  result.hasFragments = result.fragments.length > 0;
  result.hasOperations = result.operations.length > 0;

  return result;
}
