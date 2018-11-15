import { Types, DocumentFile } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import { DetailedError } from './errors';
import { IntrospectionFromUrlLoader } from './loaders/schema/introspection-from-url';
import { IntrospectionFromFileLoader } from './loaders/schema/introspection-from-file';
import { SchemaFromString } from './loaders/schema/schema-from-string';
import { SchemaFromTypedefs } from './loaders/schema/schema-from-typedefs';
import { SchemaFromExport } from './loaders/schema/schema-from-export';
import { DocumentFromString } from './loaders/documents/document-from-string';
import { DocumentsFromGlob } from './loaders/documents/documents-from-glob';

function getCustomLoaderByPath(path: string): any {
  const requiredModule = require(path);

  if (requiredModule && requiredModule.default && typeof requiredModule.default === 'function') {
    return requiredModule.default;
  }

  if (requiredModule && typeof requiredModule === 'function') {
    return requiredModule;
  }

  return null;
}

const documentsHandlers = [new DocumentFromString(), new DocumentsFromGlob()];

const schemaHandlers = [
  new IntrospectionFromUrlLoader(),
  new IntrospectionFromFileLoader(),
  new SchemaFromString(),
  new SchemaFromTypedefs(),
  new SchemaFromExport()
];

export const loadSchema = async (schemaDef: Types.Schema, config: Types.Config): Promise<GraphQLSchema> => {
  if (
    typeof schemaDef === 'object' &&
    schemaDef[Object.keys(schemaDef)[0]] &&
    (schemaDef[Object.keys(schemaDef)[0]] as any).loader &&
    typeof (schemaDef[Object.keys(schemaDef)[0]] as any).loader === 'string'
  ) {
    const pointToSchema = Object.keys(schemaDef)[0];
    const defObject: any = schemaDef[pointToSchema];
    const loaderString = defObject.loader;

    try {
      const customSchemaLoader = getCustomLoaderByPath(loaderString);

      if (customSchemaLoader) {
        const returnedSchema = await customSchemaLoader(pointToSchema, config, defObject);

        if (returnedSchema && returnedSchema instanceof GraphQLSchema) {
          return returnedSchema;
        } else {
          throw new Error(`Return value of a custom schema loader must be of type "GraphQLSchema"!`);
        }
      } else {
        throw new Error(`Unable to find a loader function! Make sure to export a default function from your file`);
      }
    } catch (e) {
      throw new DetailedError(
        'Failed to load custom schema loader',
        `
        Failed to load schema from ${pointToSchema} using loader "${loaderString}":
    
        ${e.message}
      `
      );
    }
  }

  for (const handler of schemaHandlers) {
    let pointToSchema: string = null;
    let options: any = {};

    if (typeof schemaDef === 'string') {
      pointToSchema = schemaDef as string;
    } else if (typeof schemaDef === 'object') {
      pointToSchema = Object.keys(schemaDef)[0];
      options = schemaDef[pointToSchema];
    }

    if (await handler.canHandle(pointToSchema)) {
      return handler.handle(pointToSchema, config, options);
    }
  }

  throw new DetailedError(
    'Failed to load schema',
    `
      Failed to load schema from ${schemaDef}.
  
      GraphQL Code Generator supports:
        - ES Modules and CommonJS exports
        - Introspection JSON File
        - URL of GraphQL endpoint
        - Multiple files with type definitions
        - String in config file
  
      Try to use one of above options and run codegen again.
  
    `
  );
};

export const loadDocuments = async (
  documentDef: Types.OperationDocument,
  config: Types.Config
): Promise<DocumentFile[]> => {
  if (
    typeof documentDef === 'object' &&
    documentDef[Object.keys(documentDef)[0]] &&
    (documentDef[Object.keys(documentDef)[0]] as any).loader &&
    typeof (documentDef[Object.keys(documentDef)[0]] as any).loader === 'string'
  ) {
    const pointToDoc = Object.keys(documentDef)[0];
    const defObject: any = documentDef[pointToDoc];
    const loaderString = defObject.loader;

    try {
      const customDocumentLoader = getCustomLoaderByPath(loaderString);

      if (customDocumentLoader) {
        const returned = await customDocumentLoader(pointToDoc, config);

        if (returned && Array.isArray(returned)) {
          return returned;
        } else {
          throw new Error(
            `Return value of a custom schema loader must be an Array of: { filePath: string, content: DocumentNode }`
          );
        }
      } else {
        throw new Error(`Unable to find a loader function! Make sure to export a default function from your file`);
      }
    } catch (e) {
      throw new DetailedError(
        'Failed to load custom documents loader',
        `
        Failed to load documents from ${pointToDoc} using loader "${loaderString}":
    
        ${e.message}
      `
      );
    }
  }

  for (const handler of documentsHandlers) {
    if (await handler.canHandle(documentDef as string)) {
      return handler.handle(documentDef as string, config);
    }
  }

  return [];
};
