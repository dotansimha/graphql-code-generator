import { initCommonTemplate, TypeScriptCommonConfig } from 'graphql-codegen-typescript-common';
import { DocumentFile, PluginFunction, PluginValidateFn, transformDocumentsFiles } from 'graphql-codegen-core';
import { flattenTypes } from 'graphql-codegen-plugin-helpers';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as rootTemplate from './root.handlebars';
import { importNgModules } from './helpers/import-ng-modules';
import { gql as gqlHelper } from './helpers/gql';
import gql from 'graphql-tag';
import { generateFragments } from './helpers/generate-fragments';
import { providedIn } from './helpers/provided-in';
import { namedClient } from './helpers/named-client';
import { extname } from 'path';

export interface TypeScriptApolloAngularConfig extends TypeScriptCommonConfig {
  noNamespaces?: boolean;
  noGraphqlTag?: boolean;
}

export const plugin: PluginFunction<TypeScriptApolloAngularConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptApolloAngularConfig
): Promise<string> => {
  const { templateContext, convert } = initCommonTemplate(Handlebars, schema, config);
  const transformedDocuments = transformDocumentsFiles(schema, documents);
  const flattenDocuments = flattenTypes(transformedDocuments);
  Handlebars.registerHelper('importNgModules', importNgModules);
  Handlebars.registerHelper('gql', gqlHelper(convert));
  Handlebars.registerHelper('providedIn', providedIn);
  Handlebars.registerHelper('namedClient', namedClient);
  Handlebars.registerHelper('generateFragments', generateFragments(convert));

  const hbsContext = {
    ...templateContext,
    ...flattenDocuments
  };

  return Handlebars.compile(rootTemplate)(hbsContext);
};

export const addToSchema = gql`
  directive @NgModule(module: String!) on OBJECT | FIELD
  directive @namedClient(name: String!) on OBJECT | FIELD
`;

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: any,
  outputFile: string
) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "apollo-angular" requires extension to be ".ts"!`);
  }
};
