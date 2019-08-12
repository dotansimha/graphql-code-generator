import { RawResolversConfig, ParsedResolversConfig } from './base-resolvers-visitor';

export interface ParsedMapper {
  isExternal: boolean;
  type: string;
  import?: string;
  source?: string;
  default?: boolean;
}

export function parseMapper(mapper: string, gqlTypeName: string | null = null): ParsedMapper {
  if (isExternalMapper(mapper)) {
    const items = mapper.split('#');
    const isNamespace = items.length === 3;

    const type = isNamespace ? items[2] : items[1];
    const ns = isNamespace ? items[1] : undefined;
    const source = items[0];

    const asDefault = type === 'default';
    const identifier = ns ? [ns, type].join('.') : type;
    const importElement = ns || type;

    return {
      default: asDefault,
      isExternal: true,
      source,
      type: asDefault ? gqlTypeName : identifier,
      import: asDefault ? gqlTypeName : importElement,
    };
  }

  return {
    isExternal: false,
    type: mapper,
  };
}

export function isExternalMapper(value: string): boolean {
  return value.includes('#');
}

export function transformMappers(rawMappers: RawResolversConfig['mappers']): ParsedResolversConfig['mappers'] {
  const result: ParsedResolversConfig['mappers'] = {};

  Object.keys(rawMappers).forEach(gqlTypeName => {
    const mapperDef = rawMappers[gqlTypeName];
    const parsedMapper = parseMapper(mapperDef, gqlTypeName);
    result[gqlTypeName] = parsedMapper;
  });

  return result;
}
