import { PluginFunction, DocumentFile, schemaToTemplateContext } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import { helpers } from 'graphql-codegen-plugin-handlebars-helpers';
import { resolveExternalModuleAndFn } from 'graphql-codegen-plugin-helpers';
import * as enumTemplate from './enum.handlebars';
import * as type from './type.handlebars';
import * as rootTemplate from './root.handlebars';
import * as Handlebars from 'handlebars';
import { getOptionals, getType, getEnumValue, getScalarType, defineMaybe, importEnum, concat } from './helpers';

export * from './helpers';

export interface TypeScriptNamingConventionMap {
  default?: string;
  enumValues?: string;
  typeNames?: string;
}

export interface TypeScriptCommonConfig {
  namingConvention?: string | TypeScriptNamingConventionMap;
  avoidOptionals?: boolean;
  optionalType?: string;
  constEnums?: boolean;
  enumsAsTypes?: boolean;
  immutableTypes?: boolean;
  interfacePrefix?: string;
  enums?: { [enumName: string]: { [valueName: string]: string } | string | null };
  scalars?: { [scalarName: string]: string };
}

export const DEFAULT_SCALARS = {
  String: 'string',
  Int: 'number',
  Float: 'number',
  Boolean: 'boolean',
  ID: 'string'
};

export function initCommonTemplate(hbs, schema, config: TypeScriptCommonConfig) {
  const scalars = { ...DEFAULT_SCALARS, ...(config.scalars || {}) };
  let namingConventionMap: TypeScriptNamingConventionMap;
  if (typeof config.namingConvention === 'undefined') {
    namingConventionMap = {
      default: 'change-case#pascalCase',
      enumValues: 'change-case#pascalCase',
      typeNames: 'change-case#pascalCase'
    };
  } else if (typeof config.namingConvention === 'string') {
    namingConventionMap = {
      default: config.namingConvention,
      enumValues: config.namingConvention,
      typeNames: config.namingConvention
    };
  } else {
    namingConventionMap = {
      default: config.namingConvention.default || 'change-case#pascalCase',
      enumValues: config.namingConvention.enumValues || config.namingConvention.default || 'change-case#pascalCase',
      typeNames: config.namingConvention.typeNames || config.namingConvention.default || 'change-case#pascalCase'
    };
  }
  const convert = (str: string, kind: keyof TypeScriptNamingConventionMap = 'default'): string => {
    const baseConvertFn =
      namingConventionMap[kind] === 'keep'
        ? (str: string) => str
        : resolveExternalModuleAndFn(namingConventionMap[kind]);
    if (str.charAt(0) === '_') {
      const after = str.replace(
        /^(_*)(.*)/,
        (_match, underscorePrefix, typeName) => `${underscorePrefix}${baseConvertFn(typeName || '')}`
      );

      return after;
    }

    return baseConvertFn(str);
  };
  hbs.registerPartial('enum', enumTemplate);
  hbs.registerPartial('type', type);
  hbs.registerHelper('concat', concat);
  hbs.registerHelper('defineMaybe', defineMaybe);
  hbs.registerHelper('blockComment', helpers.blockComment);
  hbs.registerHelper('blockCommentIf', helpers.blockCommentIf);
  hbs.registerHelper('toComment', helpers.toComment);
  hbs.registerHelper('convert', convert);
  hbs.registerHelper('getOptionals', getOptionals);
  hbs.registerHelper('getEnumValue', getEnumValue);
  hbs.registerHelper('importEnum', importEnum);
  hbs.registerHelper('convertedType', getType(convert));
  hbs.registerHelper('toLowerCase', helpers.toLowerCase);
  hbs.registerHelper('toUpperCase', helpers.toUpperCase);
  hbs.registerHelper('times', helpers.times);
  hbs.registerHelper('stringify', helpers.stringify);
  hbs.registerHelper('ifDirective', helpers.ifDirective);
  hbs.registerHelper('ifCond', helpers.ifCond);
  hbs.registerHelper('getScalarType', getScalarType);
  hbs.registerHelper('unlessDirective', helpers.unlessDirective);
  hbs.registerHelper('toPrimitive', type => scalars[type] || type || '');

  const templateContext = schemaToTemplateContext(schema);

  return {
    templateContext: {
      ...templateContext,
      config,
      primitives: scalars
    },
    convert,
    scalars
  };
}

export const plugin: PluginFunction<TypeScriptCommonConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptCommonConfig
): Promise<string> => {
  const { templateContext } = initCommonTemplate(Handlebars, schema, config);

  return Handlebars.compile(rootTemplate)(templateContext);
};
