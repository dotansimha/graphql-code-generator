import { join } from 'path';
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

function emitWatching() {
  log(`${logSymbols.info} Watching for changes...`);
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

  schemas.forEach((schema: string) => {
    if (isGlob(schema) || isValidPath(schema)) {
      files.push(schema);
    }
  });

  if (typeof config.watch !== 'boolean') {
    files.push(...normalizeInstanceOrArray<string>(config.watch));
  }

  let watcherSubscription: Awaited<ReturnType<typeof subscribe>>;

  const runWatcher = async () => {
    const parcelWatcher = await import('@parcel/watcher');
    debugLog(`[Watcher] Parcel watcher loaded...`);

    let isShutdown = false;

    const debouncedExec = debounce(() => {
      if (!isShutdown) {
        executeCodegen(initalContext)
          .then(onNext, () => Promise.resolve())
          .then(() => emitWatching());
      }
    }, 100);
    emitWatching();

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
      process.cwd(),
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
            const fullPath = join(process.cwd(), path);
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
