export class WatchFileSystem {
  constructor(private compiler: any, private wfs: any, private ignoredFiles: string[]) {}

  watch(files: string[], dirs: any, missing: any, startTime: any, options: any, callback: any, callbackUndelayed: any) {
    const notIgnored = (path: string) => !this.ignoredFiles.includes(path);

    return this.wfs.watch(
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

        // purge ignored files
        this.compiler.inputFileSystem.purge(this.ignoredFiles);
        // set new timestamp
        this.ignoredFiles.forEach(ignored => fileTimestamps.set(ignored, new Date().getTime()));

        callback(
          err,
          filesModified,
          dirsModified,
          missingModified,
          fileTimestamps,
          dirTimestamps,
          [...this.ignoredFiles, ...removedFiles] // add it to removed so webpack will treat it as one
        );
      },
      callbackUndelayed
    );
  }
}
