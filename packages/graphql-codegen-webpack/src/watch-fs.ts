export class WatchFileSystem {
  constructor(private compiler: any, private wfs: any, private ignoredFiles: string[]) {}

  watch(files: string[], dirs: any, missing: any, startTime: any, options: any, callback: any, callbackUndelayed: any) {
    const notIgnored = (path: string) => !this.ignoredFiles.includes(path);

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
        removedFiles: Set<string>
      ) => {
        if (err) {
          return callback(err);
        }

        // purge ignored files
        this.ignoredFiles.forEach(ignoredFile => {
          this.compiler.inputFileSystem.purge(ignoredFile);
          this.wfs.inputFileSystem.purge(ignoredFile);
        });
        this.compiler.inputFileSystem.purge(this.ignoredFiles);
        this.wfs.inputFileSystem.purge(this.ignoredFiles);

        // set new timestamp
        this.ignoredFiles.forEach(ignored => {
          fileTimestamps.set(ignored, new Date().getTime());
          removedFiles.add(ignored);
        });

        callback(
          err,
          [...this.ignoredFiles, ...filesModified],
          dirsModified,
          missingModified,
          fileTimestamps,
          dirTimestamps,
          removedFiles // add it to removed so webpack will treat it as one
        );
      },
      callbackUndelayed
    );

    return {
      close: () => watcher.close(),
      pause: () => watcher.pause(),
      getContextTimestamps: () => watcher.getContextTimestamps(),
      getFileTimestamps: () => {
        const fileTimestamps = watcher.getFileTimestamps();
        this.ignoredFiles.forEach(ignored => {
          fileTimestamps.set(ignored, new Date().getTime());
        });
        return fileTimestamps;
      }
    };
  }
}
