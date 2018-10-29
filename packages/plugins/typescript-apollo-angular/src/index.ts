import { TypeScriptCommonConfig, initCommonTemplate } from 'graphql-codegen-typescript-common';
import { PluginFunction, DocumentFile, transformDocumentsFiles } from 'graphql-codegen-core';
import { flattenTypes } from 'graphql-codegen-compiler';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as rootTemplate from './root.handlebars';
import { importNgModules } from './helpers/import-ng-modules';
import { gql } from './helpers/gql';
import { generateFragments } from './helpers/generate-fragments';
import { providedIn } from './helpers/provided-in';
import { namedClient } from './helpers/named-client';

export interface TypeScriptApolloAngularConfig extends TypeScriptCommonConfig {
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
  Handlebars.registerHelper('gql', gql(convert));
  Handlebars.registerHelper('providedIn', providedIn);
  Handlebars.registerHelper('namedClient', namedClient);
  Handlebars.registerHelper('generateFragments', generateFragments(convert));

  const hbsContext = {
    ...templateContext,
    ...flattenDocuments
  };

  return Handlebars.compile(rootTemplate)(hbsContext);
};
