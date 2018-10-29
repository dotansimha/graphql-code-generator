import { TypeScriptCommonConfig, initCommonTemplate } from 'graphql-codegen-typescript-common';
import { PluginFunction, DocumentFile, transformDocumentsFiles } from 'graphql-codegen-core';
import { flattenTypes } from 'graphql-codegen-compiler';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as rootTemplate from './root.handlebars';
import * as fragments from './fragments.handlebars';
import * as selectionSet from './selection-set.handlebars';
import { shouldHavePrefix } from './helpers';

export interface TypeScriptServerConfig extends TypeScriptCommonConfig {
  schemaNamespace?: string;
}

export const plugin: PluginFunction<TypeScriptServerConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptServerConfig
): Promise<string> => {
  const context = initCommonTemplate(Handlebars, schema, config);
  const transformedDocuments = transformDocumentsFiles(schema, documents);
  const flattenDocuments = flattenTypes(transformedDocuments);
  Handlebars.registerPartial('fragments', fragments);
  Handlebars.registerPartial('selectionSet', selectionSet);
  Handlebars.registerHelper('shouldHavePrefix', shouldHavePrefix);

  const templateContext = {
    ...context,
    ...flattenDocuments
  };

  return Handlebars.compile(rootTemplate)(templateContext);
};
