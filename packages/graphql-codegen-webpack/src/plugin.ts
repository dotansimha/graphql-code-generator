import { resolve } from 'path';
import { printSchema, print } from 'graphql';
import { compilation, compiler } from 'webpack';
import { WatchFileSystem } from './watch-fs';
import { checksum } from './utils';
import {
  CLIOptions,
  documentsFromGlobs,
  createConfig,
  createConfigFromOldCli,
  normalizeInstanceOrArray,
  normalizeOutputParam,
  loadDocuments,
  loadSchema,
  generate
} from 'graphql-code-generator';
import { Types } from 'graphql-codegen-core';
import { isUri } from 'valid-url';
import { isAbsolute } from 'path';

function forceAbsoulePath(filepath: string) {
  return isAbsolute(filepath) ? filepath : resolve(process.cwd(), filepath);
}

export class GraphQLCodegenPlugin {
  pluginName = 'GraphQLCodeGeneratorPlugin';
  schemaChecksum = '';
  documentsChecksum = '';
  documentLocations: string[] = [];
  schemaLocations: Types.Schema[] = [];
  outputFiles: string[] = [];
  config: Types.Config;
  watch = false;

  constructor(config?: string);
  constructor(options: CLIOptions);
  constructor(configOrOptions?: string | CLIOptions) {
    if (typeof configOrOptions === 'object') {
      this.initLegacy(configOrOptions);
    } else {
      this.init(configOrOptions);
    }
  }

  public apply(compiler: compiler.Compiler) {
    compiler.hooks.watchRun.tap(this.pluginName, () => {
      this.watch = true;
    });
    compiler.hooks.afterEnvironment.tap(this.pluginName, () => {
      (compiler as any).watchFileSystem = new WatchFileSystem(
        compiler,
        (compiler as any).watchFileSystem,
        this.outputFiles
      );
    });

    compiler.hooks.beforeCompile.tapPromise(this.pluginName, () => this.generate());
    compiler.hooks.afterCompile.tapPromise(this.pluginName, async compilation => {
      await this.includeDocuments(compilation);
      await this.includeSchemas(compilation);
    });
  }

  private initLegacy(options: CLIOptions) {
    this.config = createConfigFromOldCli(options);
    this.outputFiles = [forceAbsoulePath(options.out)];
    this.schemaLocations = [forceAbsoulePath(options.schema)];
    this.documentLocations = options.args;
  }

  private init(configPath?: string) {
    this.config = createConfig(configPath);
    this.outputFiles = Object.keys(this.config.generates).map(forceAbsoulePath);
    this.schemaLocations = normalizeInstanceOrArray<Types.Schema>(this.config.schema);
    this.documentLocations = normalizeInstanceOrArray(this.config.documents);

    for (const filename of Object.keys(this.config.generates)) {
      const config = normalizeOutputParam(this.config.generates[filename]);

      if (config.schema) {
        this.schemaLocations.push(...normalizeInstanceOrArray<Types.Schema>(config.schema));
      }

      if (config.documents) {
        this.schemaLocations.push(...normalizeInstanceOrArray(config.documents));
      }
    }
  }

  private async generate() {
    if (await this.shouldGenerate()) {
      try {
        await generate(this.config, true);
      } catch (error) {
        // if (this.watch) {
        //   // tslint:disable-next-line
        //   console.error(error.details || error);
        // }
        throw error;
      }
    }
  }

  private async shouldGenerate(): Promise<boolean> {
    return !(await this.didDocumentsChanged()) || !(await this.didSchemaChanged());
  }

  private async didSchemaChanged(): Promise<boolean> {
    const schemas = await Promise.all(
      this.schemaLocations.map(async location => checksum(printSchema(await loadSchema(location, this.config))))
    );
    const schemaChecksum = schemas.join('');

    const changed = schemaChecksum === this.schemaChecksum;
    this.schemaChecksum = schemaChecksum;

    return changed;
  }

  private async didDocumentsChanged(): Promise<boolean> {
    if (this.documentLocations) {
      const documents = await loadDocuments(this.documentLocations);

      const documentsChecksum = checksum(documents.map(doc => print(doc.content)).join('\n'));

      const changed = documentsChecksum === this.documentsChecksum;
      this.documentsChecksum = documentsChecksum;

      return changed;
    }

    return false;
  }

  private async includeSchemas(compilation: compilation.Compilation) {
    if (!this.schemaLocations || !this.schemaLocations.length) {
      return;
    }

    this.schemaLocations
      .filter(isFilepath)
      .map(forceAbsoulePath)
      .filter(file => !compilation.fileDependencies.has(file))
      .forEach(file => compilation.fileDependencies.add(file));
  }

  private async includeDocuments(compilation: compilation.Compilation) {
    if (!this.documentLocations || !this.documentLocations.length) {
      return;
    }

    const found = await documentsFromGlobs(this.documentLocations);

    found
      .map(forceAbsoulePath)
      .filter(file => !compilation.fileDependencies.has(file))
      .forEach(file => compilation.fileDependencies.add(file));
  }
}

function isFilepath(schema: Types.Schema): schema is string {
  return typeof schema === 'string' && !isUri(schema);
}
