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

export class GraphQLCodegenPlugin {
  pluginName = 'GraphQLCodeGeneratorPlugin';
  schemaChecksum = '';
  documentsChecksum = '';
  documentLocations: string[] = [];
  schemaLocations: Types.Schema[] = [];
  outputFiles: string[] = [];
  config: Types.Config;

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
    compiler.hooks.afterEnvironment.tap(this.pluginName, () => {
      (compiler as any).watchFileSystem = new WatchFileSystem(
        compiler,
        (compiler as any).watchFileSystem,
        this.outputFiles
      );
    });

    compiler.hooks.beforeCompile.tapPromise(this.pluginName, () => this.generate());
    compiler.hooks.afterCompile.tapPromise(this.pluginName, compilation => this.includeDocuments(compilation));
  }

  private initLegacy(options: CLIOptions) {
    this.config = createConfigFromOldCli(options);
    this.outputFiles = [resolve(process.cwd(), options.out)];
    this.schemaLocations = [resolve(process.cwd(), options.schema)];
    this.documentLocations = options.args;
  }

  private init(configPath?: string) {
    this.config = createConfig(configPath);
    this.outputFiles = Object.keys(this.config.generates);
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
      await generate(this.config, true);
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

  private async includeDocuments(compilation: compilation.Compilation) {
    if (!this.documentLocations || !this.documentLocations.length) {
      return;
    }

    const found = await documentsFromGlobs(this.documentLocations);

    found
      .filter((file: any) => !compilation.fileDependencies.has(file))
      .map(file => compilation.fileDependencies.add(file));
  }
}
