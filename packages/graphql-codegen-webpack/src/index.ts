import { generate, CLIOptions } from 'graphql-code-generator';
import { resolve } from 'path';

class IgnoringWatchFileSystem {
  constructor(private compiler: any, private wfs: any, private ignoredFile: string) {}

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
        (this.compiler.inputFileSystem as any).purge(this.ignoredFile);
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
  filepath: string;

  constructor(private options: CLIOptions) {
    this.filepath = resolve(process.cwd(), this.options.out);
  }

  apply(compiler: any) {
    compiler.hooks.afterEnvironment.tap(this.pluginName, () => {
      compiler.watchFileSystem = new IgnoringWatchFileSystem(compiler, compiler.watchFileSystem, this.filepath);
    });

    compiler.hooks.beforeCompile.tapPromise(this.pluginName, () => this.generate());
  }

  // TODO: add caching
  async generate() {
    return generate(this.options, true);
  }
}
