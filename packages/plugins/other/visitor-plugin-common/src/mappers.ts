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

export function isExternalMapperType(m: ParsedMapper): m is ExternalParsedMapper {
  return !!m['import'];
}

enum MapperKind {
  Namespace,
  Default,
  Regular,
}

export function parseMapper(mapper: string, gqlTypeName: string | null = null, suffix?: string): ParsedMapper {
  if (isExternalMapper(mapper)) {
    const items = mapper.split('#');
    const isNamespace = items.length === 3;
    const isDefault = items[1].trim() === 'default' || items[1].startsWith('default ');
    const hasAlias = items[1].includes(' as ');

    const mapperKind: MapperKind = isNamespace ? MapperKind.Namespace : isDefault ? MapperKind.Default : MapperKind.Regular;

    function handleAlias(isDefault = false) {
      const [importedType, aliasType] = items[1].split(/\s+as\s+/);

      return {
        importElement: isDefault ? aliasType : `${importedType} as ${aliasType}`,
        type: aliasType,
      };
    }

    function handle(): {
      importElement: string;
      type: string;
    } {
      switch (mapperKind) {
        // ./my/module#Namespace#Identifier
        case MapperKind.Namespace: {
          const [, ns, identifier] = items;

          return {
            type: `${ns}.${identifier}`,
            importElement: ns,
          };
        }

        case MapperKind.Default: {
          // ./my/module#Namespace#default as alias
          if (hasAlias) {
            return handleAlias(true);
          }

          // ./my/module#Namespace#default
          return {
            importElement: `${gqlTypeName}`,
            type: `${gqlTypeName}`,
          };
        }

        case MapperKind.Regular: {
          // ./my/module#Identifier as alias
          if (hasAlias) {
            return handleAlias();
          }

          const identifier = items[1];

          if (suffix) {
            const type = addSuffix(identifier, suffix);

            return {
              type,
              importElement: `${identifier} as ${type}`,
            };
          }

          // ./my/module#Identifier
          return {
            type: identifier,
            importElement: identifier,
          };
        }
      }
    }

    const { type, importElement } = handle();

    return {
      default: isDefault,
      isExternal: true,
      source: items[0],
      type,
      import: importElement.replace(/<(.*?)>/g, ''),
    };
  }

  return {
    isExternal: false,
    type: mapper,
  };
}

function addSuffix(element: string, suffix: string): string {
  const generic = element.indexOf('<');
  if (generic === -1) {
    return `${element}${suffix}`;
  }
  return `${element.slice(0, generic)}${suffix}${element.slice(generic)}`;
}

export function isExternalMapper(value: string): boolean {
  // tslint:disable-next-line:quotemark
  return value.includes('#') && !value.includes('"') && !value.includes("'");
}

export function transformMappers(rawMappers: RawResolversConfig['mappers'], mapperTypeSuffix?: string): ParsedResolversConfig['mappers'] {
  const result: ParsedResolversConfig['mappers'] = {};

  Object.keys(rawMappers).forEach(gqlTypeName => {
    const mapperDef = rawMappers[gqlTypeName];
    const parsedMapper = parseMapper(mapperDef, gqlTypeName, mapperTypeSuffix);
    result[gqlTypeName] = parsedMapper;
  });

  return result;
}
