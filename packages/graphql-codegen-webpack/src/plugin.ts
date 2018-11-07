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
  documents: string[] = [];
  schemaLocations: Types.Schema[] = [];
  outputFiles: string[] = [];
  config: Types.Config;

  constructor(config?: string);
  constructor(options: CLIOptions);
  constructor(configOrOptions?: string | CLIOptions) {
    if (typeof configOrOptions === 'object') {
      this.config = createConfigFromOldCli(configOrOptions);
      this.outputFiles = [resolve(process.cwd(), configOrOptions.out)];
      this.schemaLocations = [resolve(process.cwd(), configOrOptions.schema)];
    } else {
      this.config = createConfig(configOrOptions);
      this.schemaLocations = normalizeInstanceOrArray<Types.Schema>(this.config.schema);
    }
  }

  public apply(compiler: compiler.Compiler) {
    // compiler.hooks.watchRun.tap(this.pluginName, () => {
    //   this.options.exitOnError = false;
    // });

    compiler.hooks.afterEnvironment.tap(this.pluginName, () => {
      (compiler as any).watchFileSystem = new WatchFileSystem(
        compiler,
        (compiler as any).watchFileSystem,
        this.outputFiles
      );
    });

    compiler.hooks.beforeCompile.tapPromise(this.pluginName, () => this.generate());
    // compiler.hooks.afterCompile.tapPromise(this.pluginName, compilation => this.includeDocuments(compilation));
  }

  private async generate() {
    if (await this.shouldGenerate()) {
      await generate(this.config, true);
    }
  }

  private async shouldGenerate(): Promise<boolean> {
    return true;
    // return !(await this.didDocumentsChanged()) || !(await this.didSchemaChanged());
  }

  private async didSchemaChanged(): Promise<boolean> {
    const schemaChecksum = checksum(printSchema(await loadSchema(this.schemaLocations, this.config)));

    const changed = schemaChecksum === this.schemaChecksum;
    this.schemaChecksum = schemaChecksum;

    return changed;
  }

  // private async includeDocuments(/*compilation: compilation.Compilation*/) {
  //   // const documents = this.options.args;

  //   // if (!documents) {
  //   //   return;
  //   // }

  //   // const found = await documentsFromGlobs(documents);

  //   // found
  //   //   .filter((file: any) => !compilation.fileDependencies.has(file))
  //   //   .map(file => compilation.fileDependencies.add(file));
  // }
}
