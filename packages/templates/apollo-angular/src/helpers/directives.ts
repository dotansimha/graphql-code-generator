import { Operation } from 'graphql-codegen-core';

function R_DEF(directive: string) {
  return new RegExp(`\\s+\\@${directive}\\([^)]+\\)`, 'gm');
}

// checks if operation has a directive
export function operationHasDirective(operation: Operation, directive: string) {
  return operation.document.includes(`@${directive}`);
}

// removes a directive from string
export function removeDirective(document: string, directive: string) {
  if (operationHasDirective({ document } as Operation, directive)) {
    return document.replace(R_DEF(directive), '');
  }

  return document;
}

export function removeDirectives(document: string, directives: string[]) {
  return directives.reduce((doc, directive) => removeDirective(doc, directive), document);
}

// tries to find a directive and extract it's arguments
export function extractDirective(operation: Operation, directive: string) {
  const doc: string = operation.document;
  const directives = doc.match(R_DEF(directive));

  if (directives.length > 1) {
    throw new Error(`The ${directive} directive used multiple times in '${operation.name}' operation`);
  }

  return directives[0];
}
