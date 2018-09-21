import { extractDirective } from './directives';

const R_MOD = /module\:\s*"([^"]+)"/; // matches: module: "..."

// tries to find NgModule directive and extract {path, module}
export function extractNgModule(operation) {
  const [, link] = extractDirective(operation, 'NgModule').match(R_MOD);
  const [path, module] = link.split('#');

  return {
    path,
    module,
    link
  };
}
