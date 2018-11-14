import { Field, Type } from 'graphql-codegen-core';

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

export function pickMapper(entity: string, map: ParentsMap, options: Handlebars.HelperOptions): Mapper | undefined {
  const mapper = map[entity];

  return mapper ? parseMapper(mapper) : undefined;
}

export function useDefaultMapper(entity: Field | Type, options: Handlebars.HelperOptions): Mapper | undefined {
  const config = options.data.root.config || {};
  const defaultMapper: string | undefined = config.defaultMapper;

  return defaultMapper && canUseDefault(entity) ? parseMapper(defaultMapper) : undefined;
}

function canUseDefault(entity: Field | Type): boolean {
  if (isField(entity)) {
    return entity.isUnion || entity.isType || entity.isInterface;
  }

  return true;
}

function isField(field: any): field is Field {
  return typeof field.fieldType !== 'undefined';
}
