import { Types, CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import * as addPlugin from '@graphql-codegen/add';
import { parse, join, resolve, relative, dirname } from 'path';
import { concatAST, Kind, DocumentNode } from 'graphql';

export type NearOperationFileConfig = {
  baseTypesPath: string;
  extension?: string;
  cwd?: string;
  importTypesNamespace?: string;
};

function appendExtensionToFilePath(baseFilePath: string, extension: string) {
  const parsedPath = parse(baseFilePath);

  return parsedPath.dir + '/' + parsedPath.name + extension;
}

function clearExtension(path: string): string {
  const parsedPath = parse(path);

  return parsedPath.dir + '/' + parsedPath.name;
}

export const preset: Types.OutputPreset<NearOperationFileConfig> = {
  buildGeneratesSection: options => {
    if (!options.presetConfig.baseTypesPath) {
      throw new Error(`Preset "near-operation-file" requires you to specify "baseTypesPath" configuration and point it to your base types file!`);
    }

    const baseDir = options.presetConfig.cwd || process.cwd();
    const extension = options.presetConfig.extension || '.generated.ts';
    const importTypesNamespace = options.presetConfig.importTypesNamespace || 'Types';
    const pluginMap: { [name: string]: CodegenPlugin } = {
      ...options.pluginMap,
      add: addPlugin,
    };
    const allAst = concatAST(
      options.documents.reduce((prev, v) => {
        return [...prev, v.content];
      }, [])
    );
    const allFragmentsDocumentNode: DocumentNode = {
      kind: Kind.DOCUMENT,
      definitions: allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION),
    };

    return options.documents
      .map<Types.GenerateOptions | null>(documentFile => {
        if (documentFile.content.definitions.every(d => d.kind === Kind.FRAGMENT_DEFINITION)) {
          return null;
        }

        const absTypesPath = resolve(baseDir, join(options.baseOutputDir, options.presetConfig.baseTypesPath));
        const absFilePath = appendExtensionToFilePath(documentFile.filePath, extension);
        let relativeImportPath = clearExtension(relative(dirname(absFilePath), absTypesPath));

        if (!relativeImportPath.startsWith('..') && !relativeImportPath.startsWith('&&')) {
          relativeImportPath = `.${relativeImportPath}`;
        }
        const relevantAst = concatAST([documentFile.content, allFragmentsDocumentNode]);

        return {
          filename: absFilePath,
          plugins: [{ add: `import * as ${importTypesNamespace} from '${relativeImportPath}';\n` }, { add: `type Maybe<T> = T | null;\n` }, ...options.plugins],
          pluginMap,
          config: {
            ...options.config,
            namespacedImportName: importTypesNamespace,
          },
          schema: options.schema,
          documents: [
            {
              filePath: documentFile.filePath,
              content: relevantAst,
            },
          ],
        };
      })
      .filter(f => f);
  },
};

export default preset;
