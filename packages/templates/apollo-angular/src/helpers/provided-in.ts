import { operationHasNgModule, extractNgModule } from './ngmodule-directive';

export function providedIn(operation) {
  if (operationHasNgModule(operation)) {
    const { module } = extractNgModule(operation);

    // it's a reference so just string, without any quotes
    return module;
  }

  return `'root'`;
}
