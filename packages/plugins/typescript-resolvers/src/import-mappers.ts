import { Type } from 'graphql-codegen-core';
import { pickMapper, parseMapper } from './mappers';

interface Modules {
  [path: string]: string[];
}

export function importMappers(types: Type[], options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};
  const mappers = config.mappers || {};
  const defaultMapper: string | undefined = config.defaultMapper;
  const modules: Modules = {};
  const availableTypes = types.map(t => t.name);

  if (defaultMapper) {
    const mapper = parseMapper(defaultMapper);

    if (mapper.isExternal) {
      modules[mapper.source] = [mapper.type];
    }
  }

  for (const type in mappers) {
    if (mappers.hasOwnProperty(type)) {
      const mapper = pickMapper(type, mappers, options);

      // checks if mapper comes from a module
      // and if is used
      if (mapper && mapper.isExternal && availableTypes.includes(type)) {
        const path = mapper.source;
        if (!modules[path]) {
          modules[path] = [];
        }

        // checks for duplicates
        if (!modules[path].includes(mapper.type)) {
          modules[path].push(mapper.type);
        }
      }
    }
  }

  const imports: string[] = Object.keys(modules).map(
    path => `
      import { ${modules[path].join(', ')} } from '${path}';
    `
  );

  return imports.join('\n');
}
