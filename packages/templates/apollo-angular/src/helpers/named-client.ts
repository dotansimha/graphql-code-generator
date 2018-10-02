import { operationHasDirective, extractDirective } from './directives';
import { Operation } from 'graphql-codegen-core';

const R_NAME = /name\:\s*"([^"]+)"/; // matches: name: "..."

export function namedClient(operation: Operation): string {
  if (!operationHasDirective(operation, 'namedClient')) {
    return '';
  }

  const { name } = extractNamedClient(operation);

  return `client = '${name}';`;
}

// tries to find namedClient directive and extract {name}
export function extractNamedClient(operation: Operation) {
  const [, name] = extractDirective(operation, 'namedClient').match(R_NAME);

  return {
    name
  };
}
