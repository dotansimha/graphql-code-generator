import { extractNgModule } from './ngmodule-directive';
import { operationHasDirective } from './directives';

export function providedIn(operation) {
  if (operationHasDirective(operation, 'NgModule')) {
    const { module } = extractNgModule(operation);

    // it's a reference so just string, without any quotes
    return module;
  }

  return `'root'`;
}
