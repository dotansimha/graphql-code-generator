import { TypeScriptCommonConfig, initCommonTemplate } from 'graphql-codegen-typescript-common';
import { PluginFunction, DocumentFile } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as rootTemplate from './root.handlebars';
import * as resolver from './resolver.handlebars';
import { getFieldResolverName, getFieldResolver, getFieldType } from './helpers';
import { pickMapper } from './mappers';
import { importMappers } from './import-mappers';

export interface TypeScriptServerResolversConfig extends TypeScriptCommonConfig {
  noNamespaces?: boolean;
  contextType: string;
}

export const plugin: PluginFunction<TypeScriptServerResolversConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptServerResolversConfig
): Promise<string> => {
  const { templateContext, convert } = initCommonTemplate(Handlebars, schema, config);
  Handlebars.registerPartial('resolver', resolver);
  Handlebars.registerHelper('getFieldResolverName', getFieldResolverName(convert));
  Handlebars.registerHelper('getFieldResolver', getFieldResolver(convert));
  Handlebars.registerHelper('pickMapper', pickMapper);
  Handlebars.registerHelper('getFieldType', getFieldType(convert));
  Handlebars.registerHelper('importMappers', importMappers);

  return Handlebars.compile(rootTemplate)(templateContext);
};
