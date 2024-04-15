import * as crypto from 'crypto';
import { printExecutableGraphQLDocument, } from '@graphql-tools/documents';
import { type DocumentNode, Kind, visit, print } from 'graphql';

/**
 * This function generates a hash from a document node.
 */
export function generateDocumentHash(operation: string, algorithm: 'sha1' | 'sha256' | (string & {})): string {
  const shasum = crypto.createHash(algorithm);
  shasum.update(operation);
  return shasum.digest('hex');
}

/**
 * Normalizes and prints a document node.
 */
export function normalizeAndPrintDocumentNode(documentNode: DocumentNode, useGraphqlPrint: boolean, removeClientSpecificFields: boolean): string {
  const sanitizedDocument = visit(documentNode, {
    [Kind.FIELD](field) {
      if (removeClientSpecificFields && field.directives?.some(directive => directive.name.value === 'client')) {
        return null;
      }
    },
    [Kind.DIRECTIVE](directive) {
      if (removeClientSpecificFields && directive.name.value === 'connection') {
        return null;
      }
    },
  });

  if (useGraphqlPrint) {
    return print(sanitizedDocument);
  } else {
    return printExecutableGraphQLDocument(sanitizedDocument);
  }

}
