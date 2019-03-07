import chalk from 'chalk';
import logUpdate from 'log-update';
import indentString from 'indent-string';
import * as logSymbol from 'log-symbols';
import UpdateRenderer from 'listr-update-renderer';
import { stripIndent } from 'common-tags';
import { ListrTask } from 'listr';
import { DetailedError, isDetailedError } from '../errors';
import { Source } from 'graphql';
import { debugLog, printLogs } from 'graphql-codegen-core';

export class Renderer {
  private updateRenderer: any;

  constructor(tasks: ListrTask, options: any) {
    this.updateRenderer = new UpdateRenderer(tasks, options);
  }

  render() {
    return this.updateRenderer.render();
  }

  end(
    err: Error & {
      errors?: (Error | DetailedError)[];
    }
  ) {
    this.updateRenderer.end(err);

    if (typeof err === undefined) {
      logUpdate.clear();
      return;
    }

    // persist the output
    logUpdate.done();

    // show errors
    if (err) {
      const errorCount = err.errors ? err.errors.length : 0;

      if (errorCount > 0) {
        const count = indentString(chalk.red.bold(`Found ${errorCount} error${errorCount > 1 ? 's' : ''}`), 1);
        const details = err.errors
          .map(error => {
            debugLog(`[CLI] Exited with an error`, error);

            return isDetailedError(error) ? error.details : error;
          })
          .map((msg, i) => {
            const source: string | Source | undefined = (err.errors[i] as any).source;

            msg = chalk.gray(indentString(stripIndent(`${msg}`), 4));

            if (source) {
              const sourceOfError = typeof source === 'string' ? source : source.name;
              const title = indentString(`${logSymbol.error} ${sourceOfError}`, 2);

              return [title, msg].join('\n');
            }

            return msg;
          })
          .join('\n\n');
        logUpdate(['', count, details, ''].join('\n\n'));
      } else {
        logUpdate(chalk.red.bold(err.message));
      }
    }

    logUpdate.done();

    printLogs();
  }
}
