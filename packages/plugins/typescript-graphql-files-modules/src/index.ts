import { TypeScriptCommonConfig } from 'graphql-codegen-typescript-common';
import { PluginFunction, DocumentFile, transformDocumentsFiles } from 'graphql-codegen-core';
import { buildFilesArray } from 'graphql-codegen-compiler';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as rootTemplate from './root.handlebars';

export interface TypeScriptClientConfig extends TypeScriptCommonConfig {
  noNamespaces?: boolean;
}

export const plugin: PluginFunction<TypeScriptClientConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptClientConfig
): Promise<string> => {
  const transformedDocuments = transformDocumentsFiles(schema, documents);
  const files = buildFilesArray(transformedDocuments);

  return Handlebars.compile(rootTemplate)({ files });
};
