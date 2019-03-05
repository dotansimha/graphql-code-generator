import { initCommonTemplate, TypeScriptCommonConfig } from 'graphql-codegen-typescript-common';
import { DocumentFile, PluginFunction, PluginValidateFn, transformDocumentsFiles } from 'graphql-codegen-core';
import { flattenTypes } from 'graphql-codegen-plugin-helpers';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as rootTemplate from './root.handlebars';
import { generateFragments, gql } from './helpers';
import { extname } from 'path';
import { pascalCase } from 'change-case';

export interface TypeScriptStencilApolloConfig extends TypeScriptCommonConfig {
  noGraphqlTag?: boolean;
  noNamespaces?: boolean;
}

export const plugin: PluginFunction<TypeScriptStencilApolloConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptStencilApolloConfig
): Promise<string> => {
  const { templateContext, convert } = initCommonTemplate(Handlebars, schema, documents, config);
  const transformedDocuments = transformDocumentsFiles(schema, documents);
  const flattenDocuments = flattenTypes(transformedDocuments);
  Handlebars.registerHelper('generateFragments', generateFragments(convert));
  Handlebars.registerHelper('gql', gql(convert));
  Handlebars.registerHelper('toPascalCase', pascalCase);

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
    throw new Error(`Plugin "stencil-apollo" requires extension to be ".tsx"!`);
  }
};
