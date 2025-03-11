import { printExecutableGraphQLDocument } from '@graphql-tools/documents';
import * as crypto from 'crypto';
import { Kind, visit, type DocumentNode } from 'graphql';

const CLIENT_DIRECTIVE_NAME = 'client';
const CONNECTION_DIRECTIVE_NAME = 'connection';

/**
 * This function generates a hash from a document node.
 */
export function generateDocumentHash(
  operation: string,
  algorithm: 'sha1' | 'sha256' | (string & {}) | ((operation: string) => string)
): string {
  if (typeof algorithm === 'function') {
    return algorithm(operation);
  }
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
      if (field.directives?.some(directive => directive.name.value === CLIENT_DIRECTIVE_NAME)) {
        return null;
      }
    },
    [Kind.FRAGMENT_SPREAD](spread) {
      if (spread.directives?.some(directive => directive.name.value === CLIENT_DIRECTIVE_NAME)) {
        return null;
      }
    },
    [Kind.INLINE_FRAGMENT](fragment) {
      if (fragment.directives?.some(directive => directive.name.value === CLIENT_DIRECTIVE_NAME)) {
        return null;
      }
    },
    [Kind.DIRECTIVE](directive) {
      if (directive.name.value === CONNECTION_DIRECTIVE_NAME) {
        return null;
      }
    },
  });

  return printExecutableGraphQLDocument(sanitizedDocument);
}
