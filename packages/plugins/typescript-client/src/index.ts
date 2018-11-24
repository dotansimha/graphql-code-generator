import { TypeScriptCommonConfig, initCommonTemplate } from 'graphql-codegen-typescript-common';
import { PluginFunction, DocumentFile, transformDocumentsFiles } from 'graphql-codegen-core';
import { flattenTypes } from 'graphql-codegen-plugin-helpers';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as rootTemplate from './root.handlebars';
import * as selectionSet from './selection-set.handlebars';
import { shouldHavePrefix, fragments, convertedFieldType } from './helpers';

export interface TypeScriptClientConfig extends TypeScriptCommonConfig {
  noNamespaces?: boolean;
}

export const plugin: PluginFunction<TypeScriptClientConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptClientConfig
): Promise<string> => {
  const { templateContext, convert } = initCommonTemplate(Handlebars, schema, config);
  const transformedDocuments = transformDocumentsFiles(schema, documents);
  const flattenDocuments = flattenTypes(transformedDocuments);

  Handlebars.registerPartial('selectionSet', selectionSet);
  Handlebars.registerHelper('shouldHavePrefix', shouldHavePrefix);
  Handlebars.registerHelper('fragments', fragments(convert));
  Handlebars.registerHelper('convertedFieldType', convertedFieldType(convert));

  const hbsContext = {
    ...templateContext,
    ...flattenDocuments
  };

  return Handlebars.compile(rootTemplate)(hbsContext);
};
