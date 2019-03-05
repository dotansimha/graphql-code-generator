import { extractNgModule } from './ngmodule-directive';
import { operationHasDirective } from './directives';
import { Operation } from 'graphql-codegen-core';

export function providedIn(operation: Operation) {
  if (operationHasDirective(operation, 'NgModule')) {
    const { module } = extractNgModule(operation);

    // it's a reference so just string, without any quotes
    return module;
  }

  return `'root'`;
}
