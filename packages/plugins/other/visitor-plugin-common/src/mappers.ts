import { RawResolversConfig, ParsedResolversConfig } from './base-resolvers-visitor';

export interface ParsedMapper {
  isExternal: boolean;
  type: string;
  source?: string;
}

export function parseMapper(mapper: string): ParsedMapper {
  if (isExternalMapper(mapper)) {
    const [source, type] = mapper.split('#');

    return {
      isExternal: true,
      source,
      type,
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
    const parsedMapper = parseMapper(mapperDef);
    result[gqlTypeName] = parsedMapper;
  });

  return result;
}
