import { operationHasDirective, extractDirective } from './directives';

const R_NAME = /name\:\s*"([^"]+)"/; // matches: name: "..."

export function namedClient(operation: any): string {
  if (!operationHasDirective(operation, 'namedClient')) {
    return '';
  }

  const { name } = extractNamedClient(operation);

  return `client = '${name}';`;
}

// tries to find namedClient directive and extract {name}
export function extractNamedClient(operation) {
  const [, name] = extractDirective(operation, 'namedClient').match(R_NAME);

  return {
    name
  };
}
