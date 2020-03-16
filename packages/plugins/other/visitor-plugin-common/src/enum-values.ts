import { EnumValuesMap, ParsedEnumValuesMap } from './types';
import { GraphQLSchema, isEnumType, GraphQLEnumType } from 'graphql';
import { DetailedError } from '@graphql-codegen/plugin-helpers';
import { parseMapper, isExternalMapperType } from './mappers';

export function parseEnumValues(schema: GraphQLSchema, mapOrStr: EnumValuesMap = {}): ParsedEnumValuesMap {
  const allTypes = schema.getTypeMap();
  const allEnums = Object.keys(allTypes).filter(t => isEnumType(allTypes[t]));

  if (typeof mapOrStr === 'object') {
    for (const enumTypeName of allEnums) {
      const enumType = schema.getType(enumTypeName) as GraphQLEnumType;
      for (const { name, value } of enumType.getValues()) {
        if (value && value !== name) {
          mapOrStr[enumTypeName] = mapOrStr[enumTypeName] || {};
          if (typeof mapOrStr[enumTypeName] !== 'string' && !mapOrStr[enumTypeName][name]) {
            mapOrStr[enumTypeName][name] = value;
          }
        }
      }
    }

    const invalidMappings = Object.keys(mapOrStr).filter(gqlName => !allEnums.includes(gqlName));

    if (invalidMappings.length > 0) {
      throw new DetailedError(
        `Invalid 'enumValues' mapping!`,
        `The following types does not exist in your GraphQL schema: ${invalidMappings.join(', ')}`
      );
    }

    return Object.keys(mapOrStr).reduce((prev, gqlIdentifier) => {
      const pointer = mapOrStr[gqlIdentifier];

      if (typeof pointer === 'string') {
        const mapper = parseMapper(pointer, gqlIdentifier);

        return {
          ...prev,
          [gqlIdentifier]: {
            isDefault: mapper.isExternal && mapper.default,
            typeIdentifier: gqlIdentifier,
            sourceFile: mapper.isExternal ? mapper.source : undefined,
            sourceIdentifier: isExternalMapperType(mapper) ? mapper.import : mapper.type,
            mappedValues: null,
          },
        };
      } else if (typeof pointer === 'object') {
        return {
          ...prev,
          [gqlIdentifier]: {
            isDefault: false,
            typeIdentifier: gqlIdentifier,
            sourceFile: null,
            sourceIdentifier: null,
            mappedValues: pointer,
          },
        };
      } else {
        throw new DetailedError(
          `Invalid "enumValues" configuration`,
          `Enum "${gqlIdentifier}": expected string or object (with enum values mapping)`
        );
      }
    }, {} as ParsedEnumValuesMap);
  } else if (typeof mapOrStr === 'string') {
    return allEnums
      .filter(enumName => !enumName.startsWith('__'))
      .reduce((prev, enumName) => {
        return {
          ...prev,
          [enumName]: {
            isDefault: false,
            typeIdentifier: enumName,
            sourceFile: mapOrStr,
            sourceIdentifier: enumName,
            mappedValues: null,
          },
        };
      }, {} as ParsedEnumValuesMap);
  }

  return {};
}
