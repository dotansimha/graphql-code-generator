import { loadTypedefs, mergeTypeDefs, loadDocuments as loadDocumentsToolkit } from 'graphql-toolkit';
import { Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, DocumentNode } from 'graphql';
import { DetailedError } from '@graphql-codegen/core';
import { join } from 'path';

async function getCustomLoaderByPath(path: string): Promise<any> {
  const requiredModule = await import(join(process.cwd(), path));

  if (requiredModule && requiredModule.default && typeof requiredModule.default === 'function') {
    return requiredModule.default;
  }

  if (requiredModule && typeof requiredModule === 'function') {
    return requiredModule;
  }

  return null;
}

export const loadSchema = async (schemaDef: Types.Schema, config: Types.Config): Promise<DocumentNode> => {
  if (typeof schemaDef === 'object' && schemaDef[Object.keys(schemaDef)[0]] && (schemaDef[Object.keys(schemaDef)[0]] as any).loader && typeof (schemaDef[Object.keys(schemaDef)[0]] as any).loader === 'string') {
    const pointToSchema = Object.keys(schemaDef)[0];
    const defObject: any = schemaDef[pointToSchema];
    const loaderString = defObject.loader;

    try {
      const customSchemaLoader = await getCustomLoaderByPath(loaderString);

      if (customSchemaLoader) {
        const returnedSchema = await customSchemaLoader(pointToSchema, config, defObject);

        if (returnedSchema && isGraphQLSchema(returnedSchema)) {
          return mergeTypeDefs([returnedSchema]);
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
        ${e.stack}
      `,
        `${pointToSchema} using loader "${loaderString}"`
      );
    }
  }

  try {
    let pointToSchema: string = null;
    let options: any = {};

    if (typeof schemaDef === 'string') {
      pointToSchema = schemaDef as string;
    } else if (typeof schemaDef === 'object') {
      pointToSchema = Object.keys(schemaDef)[0];
      options = schemaDef[pointToSchema];
    }

    if (config.pluckConfig) {
      options.tagPluck = config.pluckConfig;
    }

    const docs = (await loadTypedefs(pointToSchema, options)).map(({ content }) => content);

    return mergeTypeDefs(docs);
  } catch (e) {
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
  }
};

export const loadDocuments = async (documentsDef: Types.InstanceOrArray<Types.OperationDocument>, config: Types.Config): Promise<Types.DocumentFile[]> => {
  const asArray: Types.OperationDocument[] = Array.isArray(documentsDef) ? documentsDef : [documentsDef];
  const loadWithToolkit: string[] = [];
  const result: Types.DocumentFile[] = [];

  for (const documentDef of asArray) {
    if (typeof documentDef === 'object' && documentDef[Object.keys(documentDef)[0]] && (documentDef[Object.keys(documentDef)[0]] as any).loader && typeof (documentDef[Object.keys(documentDef)[0]] as any).loader === 'string') {
      const pointToDoc = Object.keys(documentDef)[0];
      const defObject = documentDef[pointToDoc];
      const loaderString = defObject.loader;

      try {
        const customDocumentLoader = await getCustomLoaderByPath(loaderString);

        if (customDocumentLoader) {
          const returned = await customDocumentLoader(pointToDoc, config);

          if (returned && Array.isArray(returned)) {
            result.push(...returned);
          } else {
            throw new Error(`Return value of a custom schema loader must be an Array of: { filePath: string, content: DocumentNode }`);
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
    } else if (typeof documentDef === 'string') {
      loadWithToolkit.push(documentDef);
    }
  }

  if (loadWithToolkit.length > 0) {
    const loadDocumentsToolkitConfig: any = {
      ignore: Object.keys(config.generates),
    };

    if (config.pluckConfig) {
      loadDocumentsToolkitConfig.tagPluck = config.pluckConfig;
    }

    const loadedFromToolkit = await loadDocumentsToolkit(loadWithToolkit, loadDocumentsToolkitConfig);

    if (loadedFromToolkit.length > 0) {
      result.push(
        ...loadedFromToolkit.sort((a, b) => {
          if (a.filePath < b.filePath) {
            return -1;
          }

          if (a.filePath > b.filePath) {
            return 1;
          }

          return 0;
        })
      );
    }
  }

  return result;
};

function isGraphQLSchema(schema: any): schema is GraphQLSchema {
  const schemaClass = schema.constructor;
  const className = GraphQLSchema.name;
  return className && schemaClass && schemaClass.name === className;
}
