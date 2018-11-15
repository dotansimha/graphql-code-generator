import { DocumentFile, PluginFunction, PluginValidateFn, transformDocumentsFiles } from 'graphql-codegen-core';
import { buildFilesArray } from 'graphql-codegen-plugin-helpers';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as rootTemplate from './root.handlebars';

export const plugin: PluginFunction = async (schema: GraphQLSchema, documents: DocumentFile[]): Promise<string> => {
  const transformedDocuments = transformDocumentsFiles(schema, documents);
  const files = buildFilesArray(transformedDocuments);

  return Handlebars.compile(rootTemplate)({ files });
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: any,
  outputFile: string
) => {
  if (!outputFile.endsWith('.d.ts')) {
    throw new Error(`Plugin "typescript-graphql-files-modules" requires extension to be ".d.ts"!`);
  }
};
