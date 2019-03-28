import { ASTNode } from 'graphql';
import { resolveExternalModuleAndFn } from '@graphql-codegen/plugin-helpers';
import { NamingConventionMap, NamingConvention, ConvertFn, ConvertOptions } from './types';
import { pascalCase } from 'change-case';
import { convertNameParts } from './utils';

function getKind(node: ASTNode | string): keyof NamingConventionMap {
  if (typeof node === 'string') {
    return 'typeNames';
  }

  if (['EnumValueDefinition', 'EnumValue'].includes(node.kind)) {
    return 'enumValues';
  }

  return 'typeNames';
}

function getName(node: ASTNode | string): string | undefined {
  if (typeof node === 'string') {
    return node;
  }

  switch (node.kind) {
    case 'OperationDefinition':
    case 'Variable':
    case 'Argument':
    case 'FragmentSpread':
    case 'FragmentDefinition':
    case 'ObjectField':
    case 'Directive':
    case 'NamedType':
    case 'ScalarTypeDefinition':
    case 'ObjectTypeDefinition':
    case 'FieldDefinition':
    case 'InputValueDefinition':
    case 'InterfaceTypeDefinition':
    case 'UnionTypeDefinition':
    case 'EnumTypeDefinition':
    case 'EnumValueDefinition':
    case 'InputObjectTypeDefinition':
    case 'DirectiveDefinition': {
      return getName(node.name);
    }
    case 'Name': {
      return node.value;
    }
    case 'Field': {
      return getName(node.alias || node.name);
    }
    case 'VariableDefinition': {
      return getName(node.variable);
    }
  }

  return undefined;
}

export function convertFactory(config: { namingConvention?: NamingConvention }): ConvertFn {
  function resolveConventionName(type: keyof NamingConventionMap): (str: string, opts?: ConvertOptions) => string {
    if (!config.namingConvention) {
      return (str: string, opts: ConvertOptions = {}) => {
        return convertNameParts(str, pascalCase, !!(opts || {}).transformUnderscore);
      };
    }

    if (typeof config.namingConvention === 'string') {
      if (config.namingConvention === 'keep') {
        return str => str;
      }

      return (str: string, opts: ConvertOptions = {}) => {
        return convertNameParts(str, resolveExternalModuleAndFn(config.namingConvention), !!(opts || {}).transformUnderscore);
      };
    }

    if (typeof config.namingConvention === 'function') {
      return (str: string, opts: ConvertOptions = {}) => {
        return convertNameParts(str, config.namingConvention as ((str: string) => string), !!(opts || {}).transformUnderscore);
      };
    }

    if (config.namingConvention[type] === 'keep') {
      return str => str;
    }

    if (typeof config.namingConvention[type] === 'string') {
      return (str: string, opts: ConvertOptions = {}) => {
        return convertNameParts(str, resolveExternalModuleAndFn(config.namingConvention[type]), !!(opts || {}).transformUnderscore);
      };
    }

    return config.namingConvention[type] as any;
  }

  return (node, opts) => {
    const prefix = opts && opts.prefix;
    const suffix = opts && opts.suffix;

    const kind = getKind(node);
    const str = [prefix || '', getName(node), suffix || ''].join('');

    return resolveConventionName(kind)(str, opts);
  };
}
