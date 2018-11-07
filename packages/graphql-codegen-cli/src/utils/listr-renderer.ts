import chalk from 'chalk';
import * as logUpdate from 'log-update';
import * as identString from 'indent-string';
import * as UpdateRenderer from 'listr-update-renderer';
import { DetailedError, isDetailedError } from '../errors';
import { ListrTask } from 'listr';

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
      if (err.errors && err.errors.length) {
        const count = identString(chalk.red.bold(`We found ${err.errors.length} errors`), 4);
        const details = err.errors
          .map(error => {
            if (isDetailedError(error)) {
              return error.details;
            }
            return error;
          })
          .map((msg, i) => {
            const source = (err.errors[i] as any).source;
            if (source) {
              const title = identString(chalk.red(`Failed to generate ${source}`), 4);
              return [title, msg].join('\n');
            }
            return msg;
          })
          .join('\n');
        logUpdate(['', count, details].join('\n\n'));
      } else {
        logUpdate(chalk.red.bold(err.message));
      }
    }

    logUpdate.done();
  }
}
