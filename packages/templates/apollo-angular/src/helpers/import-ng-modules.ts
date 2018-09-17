import { operationHasNgModule, extractNgModule } from './ngmodule-directive';

export function importNgModules(operations: any[]) {
  const defs: Record<string, { path: string; module: string }> = {};

  operations.filter(operationHasNgModule).forEach(op => {
    const def = extractNgModule(op);

    defs[def.link] = {
      path: def.path,
      module: def.module
    };
  });

  return Object.keys(defs)
    .map(key => {
      const def = defs[key];
      return `import { ${def.module} } from '${def.path}';`;
    })
    .join('\n');
}
