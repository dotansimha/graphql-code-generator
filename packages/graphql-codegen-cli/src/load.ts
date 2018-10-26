import { CLIOptions } from './cli-options';
import { loadDocumentsSources } from './loaders/documents/document-loader';
import { documentsFromGlobs } from './utils/documents-glob';
import { IntrospectionFromFileLoader } from './loaders/schema/introspection-from-file';
import { IntrospectionFromUrlLoader } from './loaders/schema/introspection-from-url';
import { SchemaFromTypedefs } from './loaders/schema/schema-from-typedefs';
import { SchemaFromExport } from './loaders/schema/schema-from-export';

const schemaHandlers = [
  new IntrospectionFromUrlLoader(),
  new IntrospectionFromFileLoader(),
  new SchemaFromTypedefs(),
  new SchemaFromExport()
];

export async function loadSchema(pointToSchema: string, options: CLIOptions & { [key: string]: any }) {
  for (const handler of schemaHandlers) {
    if (await handler.canHandle(pointToSchema)) {
      return handler.handle(pointToSchema, options);
    }
  }

  throw new Error('Could not handle schema');
}

export async function loadDocuments(documents: string[]) {
  const foundDocumentsPaths = await documentsFromGlobs(documents);
  return loadDocumentsSources(foundDocumentsPaths);
}
