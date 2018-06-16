import { CLIOptions, executeWithOptions } from '../codegen';
import { FileOutput, debugLog, logger } from 'graphql-codegen-core';
import * as watchman from 'fb-watchman';
import * as pify from 'pify';

const getMatch = (doc: string) => {
  // strip leading `./` from pattern, it doesn't work with that
  return ['match', doc.replace(/^\.\//, ''), 'wholename'];
};

export const createWatcher = (options: CLIOptions, onNext: (result: FileOutput[]) => void) => {
  const documents = options.args || [];
  if (options.skipDocuments || documents.length === 0) {
    logger.warning('Watch mode can be used only for documents. Falling back to one-time run...');
    return executeWithOptions(options).then(onNext);
  }

  const client = pify(new watchman.Client());

  const runWatcher = async () => {
    const { version } = await client.capabilityCheck({
      optional: [],
      required: ['relative_root', 'wildmatch']
    });
    logger.info(`Watching for changes with watchman v${version}...`);

    const { warning, watch, relative_path = '' } = await client.command(['watch-project', process.cwd()]);
    if (warning) {
      logger.warning(warning);
    }

    const { clock } = await client.command(['clock', watch]);

    const sub = {
      relative_root: relative_path,
      expression: ['allof', ['anyof', ...documents.map(getMatch)], ['not', 'empty'], ['type', 'f']],
      fields: ['name', 'size', 'mtime_ms', 'exists'],
      since: clock
    };

    const { subscribe } = await client.command(['subscribe', watch, 'codegen', sub]);

    let isShutdown = false;
    const shutdown = async () => {
      isShutdown = true;
      logger.info('Shutting down watch...');
      await client.command(['unsubscribe', watch, subscribe]);
      client.end();
    };

    // it doesn't matter what has changed, need to run whole process anyway
    client.on('subscription', () => {
      if (!isShutdown) {
        executeWithOptions(options).then(onNext);
      }
    });

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  };

  // the promise never resolves to keep process running
  return new Promise((_, reject) => {
    executeWithOptions(options)
      .then(onNext)
      .then(runWatcher)
      .catch(err => {
        client.end();
        reject(err);
      });
  });
};
