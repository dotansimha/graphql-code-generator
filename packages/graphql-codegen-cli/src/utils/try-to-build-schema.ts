import { DocumentNode, GraphQLSchema, buildASTSchema } from 'graphql';
import { debugLog } from './debugging';

export function tryToBuildSchema(schema: DocumentNode): GraphQLSchema {
  try {
    return buildASTSchema(schema, { commentDescriptions: true });
  } catch (e) {
    debugLog(`Unable to build AST schema from DocumentNode, will try again later...`, e);

    return null;
  }
}
