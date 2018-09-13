import { executeWithOptions } from '../codegen';
import { FileOutput, logger } from 'graphql-codegen-core';
import * as watchman from 'fb-watchman';
import * as pify from 'pify';
import { CLIOptions } from '..';
import * as isValidPath from 'is-valid-path';
import * as isGlob from 'is-glob';

const getMatch = (doc: string) => {
  // strip leading `./` from pattern, it doesn't work with that
  return ['match', doc.replace(/^\.\//, ''), 'wholename'];
};

export const createWatcher = (options: CLIOptions, onNext: (result: FileOutput[]) => Promise<FileOutput[]>) => {
  const { args, schema } = options;
  const files = [];
  if (args) {
    files.push(...args);
  }

  if (isGlob(schema) || isValidPath(schema)) {
    files.push(schema);
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
      expression: ['allof', ['anyof', ...files.map(getMatch)], ['not', 'empty'], ['type', 'f']],
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
