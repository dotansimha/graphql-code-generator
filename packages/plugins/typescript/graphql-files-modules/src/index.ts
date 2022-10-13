import { basename, relative } from 'path';
import { Types, PluginFunction, PluginValidateFn } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';

/**
 * @description This plugin generates TypeScript typings for `.graphql` files containing GraphQL documents, which later on can be consumed using [`graphql-tag/loader`](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader) or use `string` types if you will use the operations as raw strings, and get type-check and type-safety for your imports. This means that any time you import objects from `.graphql` files, your IDE will provide auto-complete.
 *
 * This plugin also handles `.graphql` files containing multiple GraphQL documents, and name the imports according to the operation name.
 *
 * > ⚠ Fragments are not generated with named imports, only as default imports, due to `graphql-tag/loader` behavior.
 *
 */
export interface TypeScriptFilesModulesPluginConfig {
  /**
   * @default ""
   * @description Allows specifying a module definition path prefix to provide distinction
   * between generated types.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'src/api/user-service/queries.d.ts': {
   *        documents: 'src/api/user-service/queries.graphql',
   *        plugins: ['typescript-graphql-files-modules'],
   *        config: {
   *          // resulting module definition path glob: "*\/api/user-service/queries.graphql"
   *          modulePathPrefix: "/api/user-service/",
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  modulePathPrefix?: string;
  /**
   * @default false
   * @description By default, only the filename is being used to generate TS module declarations. Setting this to `true` will generate it with a full path based on the CWD.
   */
  relativeToCwd?: boolean;
  /**
   * @default *\/
   * @description By default, a wildcard is being added as prefix, you can change that to a custom prefix
   */
  prefix?: string;
  /**
   * @default "DocumentNode"
   * @description By default, the named exports will have a type `DocumentNode`. Change this to "string" if you only use raw strings.
   */
  type?: 'string' | 'DocumentNode';
}

export const plugin: PluginFunction = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  { modulePathPrefix = '', relativeToCwd, prefix = '*/', type = 'DocumentNode' }: TypeScriptFilesModulesPluginConfig
): Promise<string> => {
  const useRelative = relativeToCwd === true;

  const mappedDocuments: { [fileName: string]: OperationDefinitionNode[] } = documents.reduce(
    (prev, documentRecord) => {
      const fileName = useRelative
        ? relative(process.cwd(), documentRecord.location)
        : basename(documentRecord.location);

      if (!prev[fileName]) {
        prev[fileName] = [];
      }

      prev[fileName].push(
        ...documentRecord.document.definitions.filter(
          document => document.kind === 'OperationDefinition' || document.kind === 'FragmentDefinition'
        )
      );

      return prev;
    },
    {} as any
  );

  return Object.keys(mappedDocuments)
    .filter(fileName => mappedDocuments[fileName].length > 0)
    .map(fileName => {
      const operations = mappedDocuments[fileName];

      return `
declare module '${prefix}${modulePathPrefix}${fileName}' {
  ${type === 'DocumentNode' ? `import { DocumentNode } from 'graphql';` : ''}
  const defaultDocument: ${type};
  ${operations
    .filter(d => d.name && d.name.value)
    .map(d => `export const ${d.name.value}: ${type};`)
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
