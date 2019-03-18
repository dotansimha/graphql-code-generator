import { basename } from 'path';
import { Types, PluginFunction, PluginValidateFn } from 'graphql-codegen-plugin-helpers';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';

export const plugin: PluginFunction = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[]
): Promise<string> => {
  const mappedDocuments: { [fileName: string]: OperationDefinitionNode[] } = documents.reduce(
    (prev, documentRecord) => {
      const fileName = basename(documentRecord.filePath);

      if (!prev[fileName]) {
        prev[fileName] = [];
      }

      prev[fileName].push(
        ...documentRecord.content.definitions.filter(
          document => document.kind === 'OperationDefinition' || document.kind === 'FragmentDefinition'
        )
      );

      return prev;
    },
    {}
  );

  return Object.keys(mappedDocuments)
    .filter(fileName => mappedDocuments[fileName].length > 0)
    .map(fileName => {
      const operations = mappedDocuments[fileName];

      return `
declare module '*/${fileName}' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  ${operations
    .filter(d => d.name && d.name.value)
    .map(d => `export const ${d.name.value}: DocumentNode;`)
    .join('\n')}

  export default defaultDocument;
}
    `;
    })
    .join('\n');
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: any,
  outputFile: string
) => {
  if (!outputFile.endsWith('.d.ts')) {
    throw new Error(`Plugin "typescript-graphql-files-modules" requires extension to be ".d.ts"!`);
  }
};
