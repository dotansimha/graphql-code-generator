import { extractDirective } from './directives';
import { Operation } from 'graphql-codegen-core';

const R_MOD = /module\:\s*"([^"]+)"/; // matches: module: "..."

// tries to find NgModule directive and extract {path, module}
export function extractNgModule(operation: Operation) {
  const [, link] = extractDirective(operation, 'NgModule').match(R_MOD);
  const [path, module] = link.split('#');

  return {
    path,
    module,
    link
  };
}
