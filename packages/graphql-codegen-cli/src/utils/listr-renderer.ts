import chalk from 'chalk';
import * as logUpdate from 'log-update';
import * as indentString from 'indent-string';
import * as logSymbol from 'log-symbols';
import * as UpdateRenderer from 'listr-update-renderer';
import { stripIndent } from 'common-tags';
import { ListrTask } from 'listr';
import { DetailedError, isDetailedError } from '../errors';

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
      const indentSize = 2;
      const errorCount = err.errors ? err.errors.length : 0;

      if (errorCount > 0) {
        const count = chalk.red.bold(`Found ${errorCount} error${errorCount > 1 ? 's' : ''}`);
        const details = err.errors
          .map(error => (isDetailedError(error) ? error.details : error))
          .map((msg, i) => {
            msg = chalk.gray(indentString(stripIndent(`${msg}`), indentSize));
            const source = (err.errors[i] as any).source;

            if (source) {
              const title = `${logSymbol.error} ${source}`;

              return [title, msg].join('\n');
            }

            return msg;
          })
          .join('\n\n');
        logUpdate(['', count, details].join('\n\n'));
      } else {
        logUpdate(chalk.red.bold(err.message));
      }
    }

    logUpdate.done();
  }
}
