import { cosmiconfig, defaultLoaders } from 'cosmiconfig';
import { resolve, isAbsolute } from 'path';
import { DetailedError, Types } from '@graphql-codegen/plugin-helpers';
import { env } from 'string-env-interpolation';
import yargs from 'yargs';
import { GraphQLConfig } from 'graphql-config';
import { findAndLoadGraphQLConfig } from './graphql-config';
import { loadSchema, loadDocuments, defaultSchemaLoadOptions, defaultDocumentsLoadOptions } from './load';
import { GraphQLSchema } from 'graphql';
import yaml from 'yaml';
import { Source } from '@graphql-tools/utils';
import { cwd } from 'process';

export type YamlCliFlags = {
  config: string;
  watch: boolean | string | string[];
  require: string[];
  overwrite: boolean;
  project: string;
  silent: boolean;
  errorsOnly: boolean;
  experimentalCache: boolean;
};

function generateSearchPlaces(moduleName: string) {
  const extensions = ['json', 'yaml', 'yml', 'js', 'config.js'];
  // gives codegen.json...
  const regular = extensions.map(ext => `${moduleName}.${ext}`);
  // gives .codegenrc.json... but no .codegenrc.config.js
  const dot = extensions.filter(ext => ext !== 'config.js').map(ext => `.${moduleName}rc.${ext}`);

  return [...regular.concat(dot), 'package.json'];
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
      try {
        const result = yaml.parse(content, { prettyErrors: true, merge: true });
        return result;
      } catch (error) {
        error.message = `YAML Error in ${filepath}:\n${error.message}`;
        throw error;
      }
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
    packageProp: moduleName,
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
    s: {
      alias: 'silent',
      describe: 'Suppresses printing errors',
      type: 'boolean' as const,
    },
    e: {
      alias: 'errors-only',
      describe: 'Only print errors',
      type: 'boolean' as const,
    },
    p: {
      alias: 'project',
      describe: 'Name of a project in GraphQL Config',
      type: 'string' as const,
    },
    experimentalCache: {
      describe: 'Use experimental cache for watch mode',
      type: 'boolean' as const,
    },
  };
}

export function parseArgv(argv = process.argv): YamlCliFlags {
  return yargs.options(buildOptions()).parse(argv) as any;
}

export async function createContext(cliFlags: YamlCliFlags = parseArgv(process.argv)): Promise<CodegenContext> {
  if (cliFlags.require && cliFlags.require.length > 0) {
    await Promise.all(cliFlags.require.map(mod => import(require.resolve(mod, { paths: [process.cwd()] }))));
  }

  const customConfigPath = getCustomConfigPath(cliFlags);
  const context = await loadContext(customConfigPath);
  updateContextWithCliFlags(context, cliFlags);
  return context;
}

export function updateContextWithCliFlags(context: CodegenContext, cliFlags: YamlCliFlags) {
  const config: Partial<Types.Config & { configFilePath?: string; experimentalCache?: boolean }> = {
    configFilePath: context.filepath,
  };

  if (cliFlags.watch) {
    config.watch = cliFlags.watch;
  }

  if (cliFlags.experimentalCache) {
    config.experimentalCache = true;
  }

  if (cliFlags.overwrite === true) {
    config.overwrite = cliFlags.overwrite;
  }

  if (cliFlags.silent === true) {
    config.silent = cliFlags.silent;
  }

  if (cliFlags.errorsOnly === true) {
    config.errorsOnly = cliFlags.errorsOnly;
  }

  if (cliFlags.project) {
    context.useProject(cliFlags.project);
  }

  context.updateConfig(config);
}

function isPromiseLike<T>(value: Promise<T> | T): value is Promise<T> {
  return typeof (value as any).then === 'function';
}

class Cache {
  isEnabled: () => boolean = () => false;
  private invalidated: string[] = [];
  private sources = new Map<string, Source>();
  private dependencies = new Map<string, string[]>();

  cacheSource(fn: (pointer: string, options: any) => Source, pointer: string, options: any): Source;
  cacheSource(fn: (pointer: string, options: any) => Promise<Source>, pointer: string, options: any): Promise<Source>;
  cacheSource(fn: (pointer: string, options: any) => Promise<Source> | Source, pointer: string, options: any) {
    if (!this.isEnabled()) {
      return fn(pointer, options);
    }

    const absolutePointer = ensureAbsolutePath(pointer, options);

    if (this.sources.has(absolutePointer)) {
      return this.sources.get(absolutePointer)!;
    }

    const result = fn(pointer, options);

    if (isPromiseLike(result)) {
      return result.then(source => {
        this.sources.set(absolutePointer, source);
        return source;
      });
    }

    this.sources.set(absolutePointer, result);

    return result;
  }

  invalidate(filepaths: string[]) {
    if (!this.isEnabled()) {
      return;
    }

    this.invalidated = filepaths.map(filepath => {
      const absoluteFilepath = ensureAbsolutePath(filepath, {});
      this.sources.delete(absoluteFilepath);

      return absoluteFilepath;
    });
  }

  shouldGenerate(filepath: string): boolean {
    if (!this.isEnabled()) {
      return true;
    }

    // TODO: if new file - generate everything
    if (this.dependencies.has(filepath)) {
      if (this.invalidated.length) {
        const regenerate = this.dependencies.get(filepath).some(f => this.invalidated.includes(f));

        if (regenerate) {
          return true;
        }
      }

      return false;
    }

    return true;
  }

  setDependencies(filepath: string, deps: string[]) {
    if (!this.isEnabled()) {
      return;
    }

    this.dependencies.set(
      filepath,
      deps.map(dep => ensureAbsolutePath(dep, {}))
    );
  }
}

export class CodegenContext {
  private _config: Types.Config;
  private _graphqlConfig?: GraphQLConfig;
  private config: Types.Config;
  private _project?: string;
  private _pluginContext: { [key: string]: any } = {};
  private cache = new Cache();

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
    this.cache.isEnabled = () => (this.config as any).experimentalCache === true;
  }

  useProject(name?: string) {
    this._project = name;
  }

  getConfig<T>(extraConfig?: T): T & Types.Config {
    if (!this.config) {
      if (this._graphqlConfig) {
        const project = this._graphqlConfig.getProject(this._project);

        this.config = {
          ...project.extension('codegen'),
          schema: project.schema,
          documents: project.documents,
          pluginContext: this._pluginContext,
        };
      } else {
        this.config = { ...this._config, pluginContext: this._pluginContext };
      }
    }

    return {
      ...extraConfig,
      ...this.config,
      includeSources: true,
      cacheable: this.cacheable.bind(this),
      cacheableSync: this.cacheableSync.bind(this),
    };
  }

  updateConfig(config: Partial<Types.Config>): void {
    this.config = {
      ...this.getConfig(),
      ...config,
    };
  }

  getPluginContext(): { [key: string]: any } {
    return this._pluginContext;
  }

  async loadSchema(pointer: Types.Schema): Promise<GraphQLSchema> {
    const config = this.getConfig(defaultSchemaLoadOptions);
    if (this._graphqlConfig) {
      // TODO: SchemaWithLoader won't work here
      return this._graphqlConfig.getProject(this._project).loadSchema(pointer, 'GraphQLSchema', config);
    }
    return loadSchema(pointer, config);
  }

  async loadDocuments(pointer: Types.OperationDocument[]): Promise<Types.DocumentFile[]> {
    const config = this.getConfig(defaultDocumentsLoadOptions);
    if (this._graphqlConfig) {
      // TODO: pointer won't work here
      const documents = await this._graphqlConfig.getProject(this._project).loadDocuments(pointer, config);

      return documents;
    }

    return loadDocuments(pointer, config);
  }

  invalidate(filepaths: string[]): void {
    this.cache.invalidate(filepaths);
  }

  shouldGenerate(filepath: string) {
    return this.cache.shouldGenerate(filepath);
  }

  setDependencies(filepath: string, deps: string[]) {
    return this.cache.setDependencies(filepath, deps);
  }

  private cacheable(fn: (pointer: string, options: any) => Promise<Source>, pointer: string, options: any) {
    return this.cache.cacheSource(fn, pointer, options);
  }

  private cacheableSync(fn: (pointer: string, options: any) => Source, pointer: string, options: any) {
    return this.cache.cacheSource(fn, pointer, options);
  }
}

export function ensureContext(input: CodegenContext | Types.Config): CodegenContext {
  return input instanceof CodegenContext ? input : new CodegenContext({ config: input });
}

function ensureAbsolutePath(
  pointer: string,
  options: {
    cwd?: string;
  }
): string {
  return isAbsolute(pointer) ? pointer : resolve(options.cwd || cwd(), pointer);
}
