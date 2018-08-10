import {
  Kind,
  DefinitionNode,
  DocumentNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  OperationDefinitionNode,
  print
} from 'graphql';
import { Document } from '../types';
import { transformFragment } from './transform-fragment-document';
import { transformOperation } from './transform-operation';
import { debugLog } from '../debugging';
import { logger } from '..';

let usedNames: { [key: string]: any } = {};

function nameGenerator(operationType: string, count = 1) {
  const idea = `Anonymous_${operationType}_${count}`;

  if (usedNames[idea]) {
    return nameGenerator(operationType, count + 1);
  }

  usedNames[idea] = true;

  return idea;
}

function generateTempName(documentNode: FragmentDefinitionNode | OperationDefinitionNode): string {
  let operationType: string;

  if (documentNode.kind === Kind.FRAGMENT_DEFINITION) {
    operationType = 'fragment';
  } else if (documentNode.kind === Kind.OPERATION_DEFINITION) {
    operationType = documentNode.operation;
  }

  return nameGenerator(operationType);
}

export function fixAnonymousDocument(documentNode: FragmentDefinitionNode | OperationDefinitionNode): string | null {
  if (!documentNode.name) {
    const newName = generateTempName(documentNode);

    logger.warn(
      `The following document does not have a name. The codegen will use an anonymous name: ${newName}, please consider to name it.`,
      print(documentNode)
    );

    return newName;
  }

  return null;
}

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
      const overrideName = fixAnonymousDocument(definitionNode as OperationDefinitionNode);
      result.operations.push(transformOperation(schema, definitionNode as OperationDefinitionNode, overrideName));
    } else if (definitionNode.kind === Kind.FRAGMENT_DEFINITION) {
      const overrideName = fixAnonymousDocument(definitionNode as FragmentDefinitionNode);
      result.fragments.push(transformFragment(schema, definitionNode as FragmentDefinitionNode, overrideName));
    } else {
      logger.warn(`It seems like you provided an invalid GraphQL document of kind "${definitionNode.kind}".`);
    }
  });

  result.hasFragments = result.fragments.length > 0;
  result.hasOperations = result.operations.length > 0;

  return result;
}
