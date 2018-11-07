import { Types } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import { loadDocumentsSources } from './loaders/documents/document-loader';
import { documentsFromGlobs } from './utils/documents-glob';
import { IntrospectionFromFileLoader } from './loaders/schema/introspection-from-file';
import { IntrospectionFromUrlLoader } from './loaders/schema/introspection-from-url';
import { SchemaFromTypedefs } from './loaders/schema/schema-from-typedefs';
import { SchemaFromExport } from './loaders/schema/schema-from-export';
import { DetailedError } from './errors';

const schemaHandlers = [
  new IntrospectionFromUrlLoader(),
  new IntrospectionFromFileLoader(),
  new SchemaFromTypedefs(),
  new SchemaFromExport()
];

export async function loadSchema(schemaDef: Types.Schema, config: Types.Config): Promise<GraphQLSchema> {
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
    Failed to load schema: ${schemaDef}.

    GraphQL Code Generator supports:
      - esmodules and commonjs exports
      - introspection file
      - url of GraphQL endpoint
      - multiple files with type definitions

    Try to use one of above options and run codegen again.

  `
  );
}

export async function loadDocuments(documents: string[]) {
  const foundDocumentsPaths = await documentsFromGlobs(documents);

  return loadDocumentsSources(foundDocumentsPaths);
}
