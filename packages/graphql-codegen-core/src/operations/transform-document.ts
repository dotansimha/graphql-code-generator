import {
  Kind,
  DefinitionNode,
  DocumentNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  OperationDefinitionNode
} from 'graphql';
import { Document } from '../types';
import { transformFragment } from './transform-fragment-document';
import { transformOperation } from './transform-operation';
import { debugLog } from '../debugging';
import { logger } from '../utils/logger';

export function transformDocument(schema: GraphQLSchema, documentNode: DocumentNode): Document {
  const result: Document = {
    fragments: [],
    operations: [],
    hasFragments: false,
    hasOperations: false
  };

  const definitions = documentNode.definitions || [];

  debugLog(`[transformDocument] transforming total of ${definitions.length} definitions...`);

  definitions.forEach((definitionNode: DefinitionNode) => {
    if (definitionNode.kind === Kind.OPERATION_DEFINITION) {
      result.operations.push(transformOperation(schema, definitionNode as OperationDefinitionNode));
    } else if (definitionNode.kind === Kind.FRAGMENT_DEFINITION) {
      result.fragments.push(transformFragment(schema, definitionNode as FragmentDefinitionNode));
    } else {
      logger.warn(`It seems like you provided an invalid GraphQL document: `);
      logger.warn(definitionNode);
    }
  });

  result.hasFragments = result.fragments.length > 0;
  result.hasOperations = result.operations.length > 0;

  return result;
}
