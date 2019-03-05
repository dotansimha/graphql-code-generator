import { extractNgModule } from './ngmodule-directive';
import { operationHasDirective } from './directives';

export function importNgModules(operations: any[]) {
  const defs: Record<string, { path: string; module: string }> = {};

  operations
    .filter(op => operationHasDirective(op, 'NgModule'))
    .forEach(op => {
      const def = extractNgModule(op);

      // by setting key as link we easily get rid of duplicated imports
      // every path should be relative to the output file
      defs[def.link] = {
        path: def.path,
        module: def.module
      };
    });

  return Object.keys(defs)
    .map(key => {
      const def = defs[key];
      // Every Angular Module that I've seen in my entire life use named exports
      return `import { ${def.module} } from '${def.path}';`;
    })
    .join('\n');
}
