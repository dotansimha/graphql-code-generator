import { executeCodegen } from '../codegen';
import { FileOutput, getLogger, Types } from 'graphql-codegen-core';
import * as watchman from 'fb-watchman';
import * as pify from 'pify';
import { normalizeInstanceOrArray, normalizeOutputParam } from '../helpers';
import isValidPath = require('is-valid-path');
import * as isGlob from 'is-glob';

const getMatch = (doc: string) => {
  // strip leading `./` from pattern, it doesn't work with that
  return ['match', doc.replace(/^\.\//, ''), 'wholename'];
};

export const createWatcher = (config: Types.Config, onNext: (result: FileOutput[]) => Promise<FileOutput[]>) => {
  const files: string[] = [];
  const documents = normalizeInstanceOrArray(config.documents);
  const schemas = normalizeInstanceOrArray<Types.Schema>(config.schema);

  // Add schemas and documents from "generates"
  Object.keys(config.generates)
    .map(filename => normalizeOutputParam(config.generates[filename]))
    .forEach(conf => {
      schemas.push(...normalizeInstanceOrArray<Types.Schema>(conf.schema));
      documents.push(...normalizeInstanceOrArray<Types.OperationDocument>(conf.documents));
    });

  if (documents) {
    files.push(...documents);
  }

  schemas.forEach((schema: string) => {
    if (isGlob(schema) || isValidPath(schema)) {
      files.push(schema);
    }
  });

  const client = pify(new watchman.Client());

  const runWatcher = async () => {
    const { version } = await client.capabilityCheck({
      optional: [],
      required: ['relative_root', 'wildmatch']
    });
    getLogger().info(`Watching for changes with watchman v${version}...`);

    const { warning, watch, relative_path = '' } = await client.command(['watch-project', process.cwd()]);
    if (warning) {
      getLogger().warn(warning);
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
      getLogger().info('Shutting down watch...');
      await client.command(['unsubscribe', watch, subscribe]);
      client.end();
    };

    // it doesn't matter what has changed, need to run whole process anyway
    client.on('subscription', () => {
      if (!isShutdown) {
        executeCodegen(config).then(onNext);
      }
    });

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  };

  // the promise never resolves to keep process running
  return new Promise((_, reject) => {
    executeCodegen(config)
      .then(onNext, () => Promise.resolve())
      .then(runWatcher)
      .catch(err => {
        client.end();
        reject(err);
      });
  });
};
