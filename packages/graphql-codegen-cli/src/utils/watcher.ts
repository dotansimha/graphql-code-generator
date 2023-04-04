import { access } from 'node:fs/promises';
import { join, isAbsolute, resolve, sep } from 'path';
import { normalizeInstanceOrArray, normalizeOutputParam, Types } from '@graphql-codegen/plugin-helpers';
import { isValidPath } from '@graphql-tools/utils';
import type { subscribe } from '@parcel/watcher';
import debounce from 'debounce';
import isGlob from 'is-glob';
import mm from 'micromatch';
import logSymbols from 'log-symbols';
import { executeCodegen } from '../codegen.js';
import { CodegenContext, loadContext } from '../config.js';
import { lifecycleHooks } from '../hooks.js';
import { debugLog } from './debugging.js';
import { getLogger } from './logger.js';

function log(msg: string) {
  // double spaces to inline the message with Listr
  getLogger().info(`  ${msg}`);
}

function emitWatching(watchDir: string) {
  log(`${logSymbols.info} Watching for changes in ${watchDir}...`);
}

export const createWatcher = (
  initalContext: CodegenContext,
  onNext: (result: Types.FileOutput[]) => Promise<Types.FileOutput[]>
): Promise<void> => {
  debugLog(`[Watcher] Starting watcher...`);
  let config: Types.Config & { configFilePath?: string } = initalContext.getConfig();
  const files: string[] = [initalContext.filepath].filter(a => a);
  const documents = normalizeInstanceOrArray<Types.OperationDocument>(config.documents);
  const schemas = normalizeInstanceOrArray<Types.Schema>(config.schema);

  // Add schemas and documents from "generates"
  for (const conf of Object.keys(config.generates).map(filename => normalizeOutputParam(config.generates[filename]))) {
    schemas.push(...normalizeInstanceOrArray<Types.Schema>(conf.schema));
    documents.push(...normalizeInstanceOrArray<Types.OperationDocument>(conf.documents));
    files.push(...normalizeInstanceOrArray(conf.watchPattern));
  }

  if (documents) {
    for (const doc of documents) {
      if (typeof doc === 'string') {
        files.push(doc);
      } else {
        files.push(...Object.keys(doc));
      }
    }
  }

  for (const s of schemas) {
    const schema = s as string;
    if (isGlob(schema) || isValidPath(schema)) {
      files.push(schema);
    }
  }

  if (typeof config.watch !== 'boolean') {
    files.push(...normalizeInstanceOrArray<string>(config.watch));
  }

  let watcherSubscription: Awaited<ReturnType<typeof subscribe>>;

  const runWatcher = async () => {
    const watchDirectory = await findHighestCommonDirectory(files);

    const parcelWatcher = await import('@parcel/watcher');
    debugLog(`[Watcher] Parcel watcher loaded...`);

    let isShutdown = false;

    const debouncedExec = debounce(() => {
      if (!isShutdown) {
        executeCodegen(initalContext)
          .then(onNext, () => Promise.resolve())
          .then(() => emitWatching(watchDirectory));
      }
    }, 100);
    emitWatching(watchDirectory);

    const ignored: string[] = [];
    for (const entry of Object.keys(config.generates).map(filename => ({
      filename,
      config: normalizeOutputParam(config.generates[filename]),
    }))) {
      if (entry.config.preset) {
        const extension = entry.config.presetConfig?.extension;
        if (extension) {
          ignored.push(join(entry.filename, '**', '*' + extension));
        }
      } else {
        ignored.push(entry.filename);
      }
    }

    watcherSubscription = await parcelWatcher.subscribe(
      watchDirectory,
      async (_, events) => {
        // it doesn't matter what has changed, need to run whole process anyway
        await Promise.all(
          events.map(async ({ type: eventName, path }) => {
            /**
             * @parcel/watcher has no way to run watcher on specific files (https://github.com/parcel-bundler/watcher/issues/42)
             * But we can use micromatch to filter out events that we don't care about
             */
            if (!mm.contains(path, files)) return;

            lifecycleHooks(config.hooks).onWatchTriggered(eventName, path);
            debugLog(`[Watcher] triggered due to a file ${eventName} event: ${path}`);
            const fullPath = join(watchDirectory, path);
            // In ESM require is not defined
            try {
              delete require.cache[fullPath];
            } catch (err) {}

            if (eventName === 'update' && config.configFilePath && fullPath === config.configFilePath) {
              log(`${logSymbols.info} Config file has changed, reloading...`);
              const context = await loadContext(config.configFilePath);

              const newParsedConfig: Types.Config & { configFilePath?: string } = context.getConfig();
              newParsedConfig.watch = config.watch;
              newParsedConfig.silent = config.silent;
              newParsedConfig.overwrite = config.overwrite;
              newParsedConfig.configFilePath = config.configFilePath;
              config = newParsedConfig;
              initalContext.updateConfig(config);
            }

            debouncedExec();
          })
        );
      },
      { ignore: ignored }
    );

    debugLog(`[Watcher] Started`);

    const shutdown = () => {
      isShutdown = true;
      debugLog(`[Watcher] Shutting down`);
      log(`Shutting down watch...`);
      watcherSubscription.unsubscribe();
      lifecycleHooks(config.hooks).beforeDone();
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  };

  // the promise never resolves to keep process running
  return new Promise<void>((resolve, reject) => {
    executeCodegen(initalContext)
      .then(onNext, () => Promise.resolve())
      .then(runWatcher)
      .catch(err => {
        watcherSubscription.unsubscribe();
        reject(err);
      });
  });
};

/**
 * Given a list of file paths (each of which may be absolute, or relative to
 * `process.cwd()`), find absolute path of the "highest" common directory,
 * i.e. the directory that contains all the files in the list.
 *
 * @param files List of relative and/or absolute file paths (or micromatch patterns)
 */
const findHighestCommonDirectory = async (files: string[]): Promise<string> => {
  // Map files to a list of basePaths, where "base" is the result of mm.scan(pathOrPattern)
  // e.g. mm.scan("/**/foo/bar").base -> "/" ; mm.scan("/foo/bar/**/fizz/*.graphql") -> /foo/bar
  const dirPaths = files
    .map(filePath => (isAbsolute(filePath) ? filePath : resolve(filePath)))
    .map(patterned => mm.scan(patterned).base);

  // Return longest common prefix if it's accessible, otherwise process.cwd()
  return (async (maybeValidPath: string) => {
    debugLog(`[Watcher] Longest common prefix of all files: ${maybeValidPath}...`);
    try {
      await access(maybeValidPath);
      return maybeValidPath;
    } catch {
      log(`[Watcher] Longest common prefix (${maybeValidPath}) is not accessible`);
      log(`[Watcher] Watching current working directory (${process.cwd()}) instead`);
      return process.cwd();
    }
  })(longestCommonPrefix(dirPaths.map(path => path.split(sep))).join(sep));
};

/**
 * Find the longest common prefix of an array of paths, where each item in
 * the array an array of path segments which comprise an absolute path when
 * joined together by a path separator
 *
 * Adapted from:
 * https://duncan-mcardle.medium.com/leetcode-problem-14-longest-common-prefix-javascript-3bc6a2f777c4
 *
 * @param splitPaths An array of arrays, where each item is a path split by its separator
 * @returns An array of path segments representing the longest common prefix of splitPaths
 */
const longestCommonPrefix = (splitPaths: string[][]): string[] => {
  // Return early on empty input
  if (!splitPaths.length) {
    return [];
  }

  // Loop through the segments of the first path
  for (let i = 0; i <= splitPaths[0].length; i++) {
    // Check if this path segment is present in the same position of every path
    if (!splitPaths.every(string => string[i] === splitPaths[0][i])) {
      // If not, return the path segments up to and including the previous segment
      return splitPaths[0].slice(0, i);
    }
  }

  return splitPaths[0];
};
