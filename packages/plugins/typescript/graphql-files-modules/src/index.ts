import { basename } from 'path';
import { Types, PluginFunction, PluginValidateFn } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';

export interface TypeScriptFilesModulesPluginConfig {
  /**
   * @name modulePathPrefix
   * @type string
   * @default ''
   * @description Allows specifying a module definiton path prefix to provide distinction
   * between generated types.
   *
   * @example
   * ```yml
   * generates: src/api/user-service/queries.d.ts
   *  documents: src/api/user-service/queries.graphql
   *  plugins:
   *    - typescript
   *    - typescript-graphql-files-modules
   *  config:
   *    # resulting module definition path glob: "*\/api/user-service/queries.graphql"
   *    modulePathPrefix: "/api/user-service/"
   * ```
   */
  modulePathPrefix: string;
}

export const plugin: PluginFunction = async (schema: GraphQLSchema, documents: Types.DocumentFile[], { modulePathPrefix = '' }: TypeScriptFilesModulesPluginConfig): Promise<string> => {
  const mappedDocuments: { [fileName: string]: OperationDefinitionNode[] } = documents.reduce((prev, documentRecord) => {
    const fileName = basename(documentRecord.filePath);

    if (!prev[fileName]) {
      prev[fileName] = [];
    }

    prev[fileName].push(...documentRecord.content.definitions.filter(document => document.kind === 'OperationDefinition' || document.kind === 'FragmentDefinition'));

    return prev;
  }, {});

  return Object.keys(mappedDocuments)
    .filter(fileName => mappedDocuments[fileName].length > 0)
    .map(fileName => {
      const operations = mappedDocuments[fileName];

      return `
declare module '*/${modulePathPrefix}${fileName}' {
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

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: any, outputFile: string) => {
  if (!outputFile.endsWith('.d.ts')) {
    throw new Error(`Plugin "typescript-graphql-files-modules" requires extension to be ".d.ts"!`);
  }
};
