import { operationHasNgModule, extractNgModule } from './ngmodule-directive';

export function providedIn(operation) {
  if (operationHasNgModule(operation)) {
    const { module } = extractNgModule(operation);

    return module;
  }

  return `'root'`;
}
