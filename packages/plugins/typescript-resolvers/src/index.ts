import { TypeScriptCommonConfig, initCommonTemplate } from 'graphql-codegen-typescript-common';
import { PluginFunction, DocumentFile } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as rootTemplate from './root.handlebars';
import * as resolver from './resolver.handlebars';
import * as resolveType from './resolve-type.handlebars';
import { getFieldResolverName, getFieldResolver, getFieldType, getTypenames } from './helpers';
import { importMappers } from './import-mappers';
import { importContext, getContext } from './context';
import { getParentType, getParentTypes } from './parent-type';

export interface TypeScriptServerResolversConfig extends TypeScriptCommonConfig {
  noNamespaces?: boolean;
  contextType?: string;
  mappers?: { [name: string]: string };
  defaultMapper?: string;
}

export const plugin: PluginFunction<TypeScriptServerResolversConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptServerResolversConfig
): Promise<string> => {
  const { templateContext, convert } = initCommonTemplate(Handlebars, schema, config);
  Handlebars.registerPartial('resolver', resolver);
  Handlebars.registerPartial('resolveType', resolveType);
  Handlebars.registerHelper('getFieldResolverName', getFieldResolverName(convert));
  Handlebars.registerHelper('getFieldResolver', getFieldResolver(convert));
  Handlebars.registerHelper('getTypenames', getTypenames);
  Handlebars.registerHelper('getParentType', getParentType(convert));
  Handlebars.registerHelper('getParentTypes', getParentTypes(convert));
  Handlebars.registerHelper('getFieldType', getFieldType(convert));
  Handlebars.registerHelper('importMappers', importMappers);
  Handlebars.registerHelper('importContext', importContext);
  Handlebars.registerHelper('getContext', getContext);

  return Handlebars.compile(rootTemplate)(templateContext);
};
