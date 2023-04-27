import * as crypto from 'crypto';
import { printExecutableGraphQLDocument } from '@graphql-tools/documents';
import { type DocumentNode, Kind, visit } from 'graphql';

/**
 * This function generates a hash from a document node.
 */
export function generateDocumentHash(operation: string, algorithm: 'sha1' | 'sha256'): string {
  const shasum = crypto.createHash(algorithm);
  shasum.update(operation);
  return shasum.digest('hex');
}

/**
 * Normalizes and prints a document node.
 */
export function normalizeAndPrintDocumentNode(documentNode: DocumentNode): string {
  /**
   * This removes all client specific directives/fields from the document
   * that the server does not know about.
   * In a future version this should be more configurable.
   * If you look at this and want to customize it.
   * Send a PR :)
   */
  const sanitizedDocument = visit(documentNode, {
    [Kind.FIELD](field) {
      if (field.directives?.some(directive => directive.name.value === 'client')) {
        return null;
      }
    },
    [Kind.DIRECTIVE](directive) {
      if (directive.name.value === 'connection') {
        return null;
      }
    },
  });
  return printExecutableGraphQLDocument(sanitizedDocument);
}
