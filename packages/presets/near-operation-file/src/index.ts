import { Types, CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import * as addPlugin from '@graphql-codegen/add';
import { parse, join, resolve, relative } from 'path';

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

    return options.documents.map<Types.GenerateOptions>(documentFile => {
      const absTypesPath = resolve(baseDir, join(options.baseOutputDir, options.presetConfig.baseTypesPath));
      const absFilePath = appendExtensionToFilePath(documentFile.filePath, extension);
      const relativeImportPath = relative(absFilePath, absTypesPath);

      return {
        filename: absFilePath,
        plugins: [{ add: `import * as ${importTypesNamespace} from '${relativeImportPath}';\n` }, ...options.plugins],
        pluginMap,
        config: {
          ...options.config,
          namespacedImportName: importTypesNamespace,
        },
        schema: options.schema,
        documents: [documentFile],
      };
    });
  },
};

export default preset;
