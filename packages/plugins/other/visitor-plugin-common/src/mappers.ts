import { RawResolversConfig, ParsedResolversConfig } from './base-resolvers-visitor';

export type ParsedMapper = InternalParsedMapper | ExternalParsedMapper;
export interface InternalParsedMapper {
  isExternal: false;
  type: string;
}
export interface ExternalParsedMapper {
  isExternal: true;
  type: string;
  import: string;
  source: string;
  default: boolean;
}

export function parseMapper(mapper: string, gqlTypeName: string | null = null): ParsedMapper {
  if (isExternalMapper(mapper)) {
    const items = mapper.split('#');
    const isNamespace = items.length === 3;
    const source = items[0];
    let type,
      importElement,
      asDefault = false;

    if (isNamespace) {
      const ns = items[1];
      type = `${ns}.${items[2]}`;
      importElement = ns;
    } else {
      asDefault = items[1] === 'default';
      if (asDefault) {
        type = `${gqlTypeName}`;
        importElement = `${gqlTypeName}`;
      } else {
        if (items[1].includes(' as ')) {
          const [importedType, aliasType] = items[1].split(' as ');
          type = aliasType;
          importElement = `${importedType} as ${aliasType}`;
        } else {
          type = items[1];
          importElement = items[1];
        }
      }
    }

    return {
      default: asDefault,
      isExternal: true,
      source,
      type,
      import: importElement,
    };
  }

  return {
    isExternal: false,
    type: mapper,
  };
}

export function isExternalMapper(value: string): boolean {
  return value.includes('#') && !value.includes('"') && !value.includes('\'');
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
