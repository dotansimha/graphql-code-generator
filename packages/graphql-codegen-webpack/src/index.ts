import { generate, CLIOptions, loadSchema } from 'graphql-code-generator';
import { resolve } from 'path';
import { printSchema } from 'graphql';
import { createHash } from 'crypto';

class IgnoringWatchFileSystem {
  constructor(private compiler: any, private wfs: any, private ignoredFile: string) {}

  // TODO: include documents
  watch(files: string[], dirs: any, missing: any, startTime: any, options: any, callback: any, callbackUndelayed: any) {
    const notIgnored = (path: string) => path !== this.ignoredFile;

    const watcher = this.wfs.watch(
      files.filter(notIgnored),
      dirs,
      missing,
      startTime,
      options,
      (
        err: any,
        filesModified: string[] | undefined,
        dirsModified: string[] | undefined,
        missingModified: string[] | undefined,
        fileTimestamps: Map<string, number>,
        dirTimestamps: Map<string, number>,
        removedFiles: string[] | undefined
      ) => {
        if (err) {
          return callback(err);
        }

        // purge ignored file
        this.compiler.inputFileSystem.purge(this.ignoredFile);
        // set new timestamp
        fileTimestamps.set(this.ignoredFile, new Date().getTime());

        callback(
          err,
          filesModified,
          dirsModified,
          missingModified,
          fileTimestamps,
          dirTimestamps,
          [this.ignoredFile, ...removedFiles] // add it to removed so webpack will treat it as one
        );
      },
      callbackUndelayed
    );

    return {
      close: () => watcher.close(),
      pause: () => watcher.pause(),
      getContextTimestamps: () => watcher.getContextTimestamps(),
      getFileTimestamps: () => watcher.getFileTimestamps()
    };
  }
}

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

  apply(compiler: any) {
    compiler.hooks.afterEnvironment.tap(this.pluginName, () => {
      compiler.watchFileSystem = new IgnoringWatchFileSystem(compiler, compiler.watchFileSystem, this.outputFile);
    });

    compiler.hooks.beforeCompile.tapPromise(this.pluginName, () => this.generate());
  }

  async generate() {
    const schemaChecksum = checksum(printSchema(await loadSchema(this.schemaLocation, this.options)));

    if (schemaChecksum === this.schemaChecksum) {
      return;
    } else {
      this.schemaChecksum = schemaChecksum;
    }

    return generate(this.options, true);
  }
}

function checksum(str: string) {
  return createHash('md5')
    .update(str, 'utf8')
    .digest('hex');
}
