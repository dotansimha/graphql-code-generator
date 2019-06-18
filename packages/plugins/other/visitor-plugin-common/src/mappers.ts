import { RawResolversConfig, ParsedResolversConfig } from './base-resolvers-visitor';

export interface ParsedMapper {
  isExternal: boolean;
  type: string;
  source?: string;
  default?: boolean;
}

export function parseMapper(mapper: string, gqlTypeName: string | null = null): ParsedMapper {
  if (isExternalMapper(mapper)) {
    const [source, type] = mapper.split('#');
    const asDefault = type === 'default';

    return {
      default: asDefault,
      isExternal: true,
      source,
      type: asDefault ? gqlTypeName : type,
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
