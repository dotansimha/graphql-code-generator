import { initCommonTemplate, TypeScriptCommonConfig } from 'graphql-codegen-typescript-common';
import { DocumentFile, PluginFunction, PluginValidateFn, transformDocumentsFiles } from 'graphql-codegen-core';
import { flattenTypes } from 'graphql-codegen-plugin-helpers';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as rootTemplate from './root.handlebars';
import { generateFragments, gql, propsType, getImports } from './helpers';
import { extname } from 'path';

export interface TypeScriptReactApolloConfig extends TypeScriptCommonConfig {
  noGraphqlTag?: boolean;
  noNamespaces?: boolean;
  withHOC?: boolean;
  withComponents?: boolean;
  withHooks?: boolean | string;
  gqlImport?: string;
}

export const plugin: PluginFunction<TypeScriptReactApolloConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptReactApolloConfig = {}
): Promise<string> => {
  config.withHOC = 'withHOC' in config ? config.withHOC : true;
  config.withComponents = 'withComponents' in config ? config.withComponents : true;
  const { templateContext, convert } = initCommonTemplate(Handlebars, schema, config);
  const transformedDocuments = transformDocumentsFiles(schema, documents);
  const flattenDocuments = flattenTypes(transformedDocuments);
  Handlebars.registerHelper('generateFragments', generateFragments(convert));
  Handlebars.registerHelper('gql', gql(convert));
  Handlebars.registerHelper('propsType', propsType(convert));
  Handlebars.registerHelper('getImports', getImports);

  const hbsContext = {
    ...templateContext,
    ...flattenDocuments
  };

  return Handlebars.compile(rootTemplate)(hbsContext);
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: any,
  outputFile: string
) => {
  if (extname(outputFile) !== '.tsx') {
    throw new Error(`Plugin "react-apollo" requires extension to be ".tsx"!`);
  }
};
