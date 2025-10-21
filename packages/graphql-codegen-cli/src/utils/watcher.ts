import { join, isAbsolute, relative, resolve, sep } from 'path';
import { normalizeOutputParam, Types } from '@graphql-codegen/plugin-helpers';
import type { subscribe } from '@parcel/watcher';
import debounce from 'debounce';
import mm from 'micromatch';
import logSymbols from 'log-symbols';
import { executeCodegen } from '../codegen.js';
import { CodegenContext, loadContext } from '../config.js';
import { lifecycleHooks } from '../hooks.js';
import { access } from './file-system.js';
import { debugLog } from './debugging.js';
import { getLogger } from './logger.js';
import {
  allAffirmativePatternsFromPatternSets,
  makeGlobalPatternSet,
  makeLocalPatternSet,
  makeShouldRebuild,
} from './patterns.js';
import { AbortController } from './abort-controller-polyfill.js';

function log(msg: string) {
  // double spaces to inline the message with Listr
  getLogger().info(`  ${msg}`);
}

function emitWatching(watchDir: string) {
  log(`${logSymbols.info} Watching for changes in ${watchDir}...`);
}

export const createWatcher = (
  initialContext: CodegenContext,
  onNext: (result: Types.FileOutput[]) => Promise<Types.FileOutput[]>
): {
  /**
   * Call this function to stop the running watch server
   *
   * @returns Promise that resolves when watcher has terminated ({@link runningWatcher} promise settled)
   * */
  stopWatching: () => Promise<void>;
  /**
   * Promise that will never resolve as long as the watcher is running. To stop
   * the watcher, call {@link stopWatching}, which will send a stop signal and
   * then return a promise that doesn't resolve until `runningWatcher` has resolved.
   * */
  runningWatcher: Promise<void>;
} => {
  debugLog(`[Watcher] Starting watcher...`);
  let config: Types.Config & { configFilePath?: string } = initialContext.getConfig();

  const globalPatternSet = makeGlobalPatternSet(initialContext);
  const localPatternSets = Object.keys(config.generates)
    .map(filename => normalizeOutputParam(config.generates[filename]))
    .map(conf => makeLocalPatternSet(conf));
  const allAffirmativePatterns = allAffirmativePatternsFromPatternSets([globalPatternSet, ...localPatternSets]);

  const shouldRebuild = makeShouldRebuild({ globalPatternSet, localPatternSets });

  let watcherSubscription: Awaited<ReturnType<typeof subscribe>>;

  const runWatcher = async (abortSignal: AbortSignal) => {
    const watchDirectory = await findHighestCommonDirectory(allAffirmativePatterns);

    // Try to load the parcel watcher, but don't fail if it's not available.
    let parcelWatcher: typeof import('@parcel/watcher');
    try {
      parcelWatcher = await import('@parcel/watcher');
    } catch {
      log(
        'Failed to import @parcel/watcher.\n  To use watch mode, install https://www.npmjs.com/package/@parcel/watcher.'
      );
      return;
    }

    debugLog(`[Watcher] Parcel watcher loaded...`);

    let isShutdown = false;

    const debouncedExec = debounce(() => {
      if (!isShutdown) {
        executeCodegen(initialContext)
          .then(
            ({ result, error }) => {
              // FIXME: this is a quick fix to stop `onNext` (writeOutput) from
              // removing all files when there is an error.
              //
              // This is because `removeStaleFiles()` will remove files if the
              // generated files are different between runs. And on error, it
              // returns an empty array i.e. will remove all generated files from
              // the previous run
              //
              // This also means we don't have config.allowPartialOutputs in watch mode
              if (error) {
                return;
              }
              onNext(result);
            },
            () => Promise.resolve()
          )
          .then(() => emitWatching(watchDirectory));
      }
    }, 100);
    emitWatching(watchDirectory);

    const ignored: string[] = ['**/.git/**'];
    for (const entry of Object.keys(config.generates).map(filename => ({
      filename,
      config: normalizeOutputParam(config.generates[filename]),
    }))) {
      // ParcelWatcher expects relative ignore patterns to be relative from watchDirectory,
      // but we expect filename from config to be relative from cwd, so we need to convert
      const filenameRelativeFromWatchDirectory = relative(watchDirectory, resolve(process.cwd(), entry.filename));

      if (entry.config.preset) {
        const extension = entry.config.presetConfig?.extension;
        if (extension) {
          ignored.push(join(filenameRelativeFromWatchDirectory, '**', '*' + extension));
        }
      } else {
        ignored.push(filenameRelativeFromWatchDirectory);
      }
    }

    watcherSubscription = await parcelWatcher.subscribe(
      watchDirectory,
      async (_, events) => {
        // it doesn't matter what has changed, need to run whole process anyway
        await Promise.all(
          // NOTE: @parcel/watcher always provides path as an absolute path
          events.map(async ({ type: eventName, path }) => {
            if (!shouldRebuild({ path })) {
              return;
            }

            lifecycleHooks(config.hooks).onWatchTriggered(eventName, path);
            debugLog(`[Watcher] triggered due to a file ${eventName} event: ${path}`);
            // In ESM require is not defined
            try {
              delete require.cache[path];
            } catch {}

            if (eventName === 'update' && config.configFilePath && path === config.configFilePath) {
              log(`${logSymbols.info} Config file has changed, reloading...`);
              const context = await loadContext(config.configFilePath);

              const newParsedConfig: Types.Config & { configFilePath?: string } = context.getConfig();
              newParsedConfig.watch = config.watch;
              newParsedConfig.silent = config.silent;
              newParsedConfig.overwrite = config.overwrite;
              newParsedConfig.configFilePath = config.configFilePath;
              config = newParsedConfig;
              initialContext.updateConfig(config);
            }

            debouncedExec();
          })
        );
      },
      { ignore: ignored }
    );

    debugLog(`[Watcher] Started`);

    const shutdown = (
      /** Optional callback to execute after shutdown has completed its async tasks */
      afterShutdown?: () => void
    ) => {
      isShutdown = true;
      debugLog(`[Watcher] Shutting down`);
      log(`Shutting down watch...`);

      const pendingUnsubscribe = watcherSubscription.unsubscribe();
      const pendingBeforeDoneHook = lifecycleHooks(config.hooks).beforeDone();

      if (afterShutdown && typeof afterShutdown === 'function') {
        Promise.allSettled([pendingUnsubscribe, pendingBeforeDoneHook]).then(afterShutdown);
      }
    };

    abortSignal.addEventListener('abort', () => shutdown(abortSignal.reason));

    process.once('SIGINT', () => shutdown());
    process.once('SIGTERM', () => shutdown());
  };

  // Use an AbortController for shutdown signals
  // NOTE: This will be polyfilled on Node 14 (or any environment without it defined)
  const abortController = new AbortController();

  /**
   * Send shutdown signal and return a promise that only resolves after the
   * runningWatcher has resolved, which only resolved after the shutdown signal has been handled
   */
  const stopWatching = async function () {
    // stopWatching.afterShutdown is lazily set to resolve pendingShutdown promise
    abortController.abort(stopWatching.afterShutdown);

    // SUBTLE: runningWatcher waits for pendingShutdown before it resolves itself, so
    // by awaiting it here, we are awaiting both the shutdown handler, and runningWatcher itself
    await stopWatching.runningWatcher;
  };
  stopWatching.afterShutdown = () => {
    debugLog('Shutdown watcher before it started');
  };
  stopWatching.runningWatcher = Promise.resolve();

  /** Promise will resolve after the shutdown() handler completes */
  const pendingShutdown = new Promise<void>(afterShutdown => {
    // afterShutdown will be passed to shutdown() handler via abortSignal.reason
    stopWatching.afterShutdown = afterShutdown;
  });

  /**
   * Promise that resolves after the watch server has shutdown, either because
   * stopWatching() was called or there was an error inside it
   */
  stopWatching.runningWatcher = new Promise<void>((resolve, reject) => {
    executeCodegen(initialContext)
      .then(
        ({ result, error }) => {
          // TODO: this is the initial run, the logic here mimics the above watcher logic.
          // We need to check whether it's ok to deviate between these two.
          if (error) {
            return;
          }
          onNext(result);
        },
        () => Promise.resolve()
      )
      .then(() => runWatcher(abortController.signal))
      .catch(err => {
        watcherSubscription.unsubscribe();
        reject(err);
      })
      .then(() => pendingShutdown)
      .finally(() => {
        debugLog('Done watching.');
        resolve();
      });
  });

  return {
    stopWatching,
    runningWatcher: stopWatching.runningWatcher,
  };
};

/**
 * Given a list of file paths (each of which may be absolute, or relative from
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
    // mm.scan doesn't know how to handle Windows \ path separator
    .map(patterned => patterned.replace(/\\/g, '/'))
    .map(patterned => mm.scan(patterned).base)
    // revert the separators to the platform-supported ones
    .map(base => base.replace(/\//g, sep));

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
