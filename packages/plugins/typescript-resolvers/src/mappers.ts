export interface ParentsMap {
  [key: string]: string;
}

export interface Mapper {
  isExternal: boolean;
  type: string;
  source?: string;
}

function isExternal(value: string) {
  return value.includes('#');
}

export function parseMapper(mapper: string): Mapper {
  if (isExternal(mapper)) {
    const [source, type] = mapper.split('#');
    return {
      isExternal: true,
      source,
      type
    };
  }

  return {
    isExternal: false,
    type: mapper
  };
}

export function pickMapper(name: string, map: ParentsMap, options: Handlebars.HelperOptions): Mapper | undefined {
  const config = options.data.root.config || {};
  const defaultMapper: string | undefined = config.defaultMapper;
  const mapper = map[name];

  if (!mapper && defaultMapper) {
    return parseMapper(defaultMapper);
  }

  if (!mapper) {
    return undefined;
  }

  return parseMapper(mapper);
}
