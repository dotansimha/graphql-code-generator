import { cosmiconfig, defaultLoaders } from 'cosmiconfig';
import { resolve } from 'path';
import { DetailedError, Types } from '@graphql-codegen/plugin-helpers';
import { env } from 'string-env-interpolation';
import yargs from 'yargs';
import { GraphQLConfig } from 'graphql-config';
import { findAndLoadGraphQLConfig } from './graphql-config';
import { loadSchema, loadDocuments } from './load';

export type YamlCliFlags = {
  config: string;
  watch: boolean | string | string[];
  require: string[];
  overwrite: boolean;
  project: string;
  silent: boolean;
};

function generateSearchPlaces(moduleName: string) {
  const extensions = ['json', 'yaml', 'yml', 'js', 'config.js'];
  // gives codegen.json...
  const regular = extensions.map(ext => `${moduleName}.${ext}`);
  // gives .codegenrc.json... but no .codegenrc.config.js
  const dot = extensions.filter(ext => ext !== 'config.js').map(ext => `.${moduleName}rc.${ext}`);

  return regular.concat(dot);
}

function customLoader(ext: 'json' | 'yaml' | 'js') {
  function loader(filepath: string, content: string) {
    if (typeof process !== 'undefined' && 'env' in process) {
      content = env(content);
    }

    if (ext === 'json') {
      return defaultLoaders['.json'](filepath, content);
    }

    if (ext === 'yaml') {
      return defaultLoaders['.yaml'](filepath, content);
    }

    if (ext === 'js') {
      return defaultLoaders['.js'](filepath, content);
    }
  }

  return loader;
}

export async function loadContext(configFilePath?: string): Promise<CodegenContext> | never {
  const moduleName = 'codegen';
  const cosmi = cosmiconfig(moduleName, {
    searchPlaces: generateSearchPlaces(moduleName),
    loaders: {
      '.json': customLoader('json'),
      '.yaml': customLoader('yaml'),
      '.yml': customLoader('yaml'),
      '.js': customLoader('js'),
      noExt: customLoader('yaml'),
    },
  });

  const graphqlConfig = await findAndLoadGraphQLConfig(configFilePath);

  if (graphqlConfig) {
    return new CodegenContext({
      graphqlConfig,
    });
  }

  const result = await (configFilePath ? cosmi.load(configFilePath) : cosmi.search(process.cwd()));

  if (!result) {
    if (configFilePath) {
      throw new DetailedError(
        `Config ${configFilePath} does not exist`,
        `
        Config ${configFilePath} does not exist.
  
          $ graphql-codegen --config ${configFilePath}
  
        Please make sure the --config points to a correct file.
      `
      );
    }

    throw new DetailedError(
      `Unable to find Codegen config file!`,
      `
        Please make sure that you have a configuration file under the current directory! 
      `
    );
  }

  if (result.isEmpty) {
    throw new DetailedError(
      `Found Codegen config file but it was empty!`,
      `
        Please make sure that you have a valid configuration file under the current directory!
      `
    );
  }

  return new CodegenContext({
    filepath: result.filepath,
    config: result.config as Types.Config,
  });
}

function getCustomConfigPath(cliFlags: YamlCliFlags): string | null | never {
  const configFile = cliFlags.config;

  return configFile ? resolve(process.cwd(), configFile) : null;
}

export function buildOptions() {
  return {
    c: {
      alias: 'config',
      type: 'string' as const,
      describe: 'Path to GraphQL codegen YAML config file, defaults to "codegen.yml" on the current directory',
    },
    w: {
      alias: 'watch',
      describe:
        'Watch for changes and execute generation automatically. You can also specify a glob expreession for custom watch list.',
      coerce: (watch: any) => {
        if (watch === 'false') {
          return false;
        }
        if (typeof watch === 'string' || Array.isArray(watch)) {
          return watch;
        }
        return true;
      },
    },
    r: {
      alias: 'require',
      describe: 'Loads specific require.extensions before running the codegen and reading the configuration',
      type: 'array' as const,
      default: [],
    },
    o: {
      alias: 'overwrite',
      describe: 'Overwrites existing files',
      type: 'boolean' as const,
    },
    p: {
      alias: 'project',
      describe: 'Name of a project in GraphQL Config',
      type: 'string' as const,
    },
  };
}

export function parseArgv(argv = process.argv): YamlCliFlags {
  return yargs.options(buildOptions()).parse(argv) as any;
}

export async function createContext(cliFlags: YamlCliFlags = parseArgv(process.argv)): Promise<CodegenContext> {
  if (cliFlags.require && cliFlags.require.length > 0) {
    await Promise.all(cliFlags.require.map(mod => import(mod)));
  }

  const customConfigPath = getCustomConfigPath(cliFlags);
  const context = await loadContext(customConfigPath);
  updateContextWithCliFlags(context, cliFlags);
  return context;
}

export function updateContextWithCliFlags(context: CodegenContext, cliFlags: YamlCliFlags) {
  const config: Partial<Types.Config & { configFilePath?: string }> = {
    configFilePath: context.filepath,
  };

  if (cliFlags.watch) {
    config.watch = cliFlags.watch;
  }

  if (cliFlags.overwrite === true) {
    config.overwrite = cliFlags.overwrite;
  }

  if (cliFlags.silent === true) {
    config.silent = cliFlags.silent;
  }

  if (cliFlags.project) {
    context.useProject(cliFlags.project);
  }

  context.updateConfig(config);
}

export class CodegenContext {
  private _config: Types.Config;
  private _graphqlConfig?: GraphQLConfig;
  private config: Types.Config;
  private _project?: string;
  cwd: string;
  filepath: string;

  constructor({
    config,
    graphqlConfig,
    filepath,
  }: {
    config?: Types.Config;
    graphqlConfig?: GraphQLConfig;
    filepath?: string;
  }) {
    this._config = config;
    this._graphqlConfig = graphqlConfig;
    this.filepath = this._graphqlConfig ? this._graphqlConfig.filepath : filepath;
    this.cwd = this._graphqlConfig ? this._graphqlConfig.dirpath : process.cwd();
  }

  useProject(name?: string) {
    this._project = name;
  }

  getConfig(): Types.Config {
    if (!this.config) {
      if (this._graphqlConfig) {
        const project = this._graphqlConfig.getProject(this._project);

        this.config = {
          ...project.extension('codegen'),
          schema: project.schema,
          documents: project.documents,
        };
      } else {
        this.config = this._config;
      }
    }

    return this.config;
  }

  updateConfig(config: Partial<Types.Config>): void {
    this.config = {
      ...this.getConfig(),
      ...config,
    };
  }

  async loadSchema(pointer: Types.Schema) {
    if (this._graphqlConfig) {
      // TODO: SchemaWithLoader won't work here
      return this._graphqlConfig.getProject(this._project).loadSchema(pointer);
    }
    return loadSchema(pointer, this.getConfig());
  }

  async loadDocuments(pointer: Types.OperationDocument[]): Promise<Types.DocumentFile[]> {
    if (this._graphqlConfig) {
      // TODO: pointer won't work here
      const documents = await this._graphqlConfig.getProject(this._project).loadDocuments(pointer);

      return documents;
    }

    return loadDocuments(pointer, this.getConfig());
  }
}

export function ensureContext(input: CodegenContext | Types.Config): CodegenContext {
  return input instanceof CodegenContext ? input : new CodegenContext({ config: input });
}
