import { generate, CLIOptions, loadSchema, loadDocuments } from 'graphql-code-generator';
import { documentsFromGlobs } from 'graphql-code-generator/dist/utils/documents-glob';
import { resolve } from 'path';
import { printSchema, print } from 'graphql';
import { compilation, compiler } from 'webpack';

import { WatchFileSystem } from './watch-fs';
import { checksum } from './utils';

export class GraphQLCodegenPlugin {
  pluginName = 'GraphQLCodeGeneratorPlugin';
  outputFile: string;
  schemaLocation: string;
  schemaChecksum = '';
  documentsChecksum = '';

  constructor(private options: CLIOptions) {
    this.outputFile = resolve(process.cwd(), this.options.out);
    this.schemaLocation = resolve(process.cwd(), this.options.schema);
  }

  public apply(compiler: compiler.Compiler) {
    compiler.hooks.watchRun.tap(this.pluginName, () => {
      this.options.exitOnError = false;
    });

    compiler.hooks.afterEnvironment.tap(this.pluginName, () => {
      (compiler as any).watchFileSystem = new WatchFileSystem(
        compiler,
        (compiler as any).watchFileSystem,
        this.outputFile
      );
    });

    compiler.hooks.beforeCompile.tapPromise(this.pluginName, () => this.generate());

    compiler.hooks.afterCompile.tapPromise(this.pluginName, compilation => this.includeDocuments(compilation));
  }

  private async generate() {
    if (await this.shouldGenerate()) {
      await generate(this.options, true);
    }
  }

  private async shouldGenerate(): Promise<boolean> {
    return !(await this.didDocumentsChanged()) || !(await this.didSchemaChanged());
  }

  private async didDocumentsChanged(): Promise<boolean> {
    if (this.options.args) {
      const documents = await loadDocuments(this.options.args);

      const documentsChecksum = checksum(documents.map(doc => print(doc.content)).join('\n'));

      const changed = documentsChecksum === this.documentsChecksum;
      this.documentsChecksum = documentsChecksum;

      return changed;
    }

    return false;
  }

  private async didSchemaChanged(): Promise<boolean> {
    const schemaChecksum = checksum(printSchema(await loadSchema(this.schemaLocation, this.options)));

    const changed = schemaChecksum === this.schemaChecksum;
    this.schemaChecksum = schemaChecksum;

    return changed;
  }

  private async includeDocuments(compilation: compilation.Compilation) {
    const documents = this.options.args;

    if (!documents) {
      return;
    }

    const found = await documentsFromGlobs(documents);

    found.filter(file => !compilation.fileDependencies.has(file)).map(file => compilation.fileDependencies.add(file));
  }
}
