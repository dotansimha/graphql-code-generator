import { loadDocumentsSources } from './loaders/documents/document-loader';
import { documentsFromGlobs } from './utils/documents-glob';
import { IntrospectionFromFileLoader } from './loaders/schema/introspection-from-file';
import { IntrospectionFromUrlLoader } from './loaders/schema/introspection-from-url';
import { SchemaFromTypedefs } from './loaders/schema/schema-from-typedefs';
import { SchemaFromExport } from './loaders/schema/schema-from-export';
import { DetailedError } from './errors';
import { CLIOptions, createConfigFromOldCli } from './old-cli-config';

const schemaHandlers = [
  new IntrospectionFromUrlLoader(),
  new IntrospectionFromFileLoader(),
  new SchemaFromTypedefs(),
  new SchemaFromExport()
];

export async function loadSchema(pointToSchema: string, options: CLIOptions & { [key: string]: any }) {
  for (const handler of schemaHandlers) {
    if (await handler.canHandle(pointToSchema)) {
      return handler.handle(pointToSchema, createConfigFromOldCli(options), null);
    }
  }

  throw new DetailedError(
    'Failed to load schema',
    `
    Failed to load schema from ${pointToSchema}.

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
