// import chalk from 'chalk';
// import { indentString } from './indentString';
// import logSymbol from 'log-symbols';
// import ansiEscapes from 'ansi-escapes';
// import wrapAnsi from 'wrap-ansi';
// import { stripIndent } from 'common-tags';
// import {
//   ListrRenderer,
//   ListrEvent,
//   ListrTaskObject,
//   Logger,
//   ListrEventType,
//   ListrDefaultRenderer,
// } from 'listr2';
// import { DetailedError, isDetailedError } from '@graphql-codegen/plugin-helpers';
// import { Source } from 'graphql';
// import { debugLog, printLogs } from './debugging';
// // import UpdateRenderer from 'listr-update-renderer';

// export class Renderer extends ListrDefaultRenderer {
//   private logger: Logger;

//   constructor(
//     public tasks: ListrTaskObject<any, typeof Renderer>[],
//     public options: typeof Renderer['rendererOptions']
//   ) {

//   end(
//     err: Error & {
//       errors?: (Error | DetailedError)[];
//       details?: string;
//     }
//   ) {
//     if (typeof err === 'undefined') {
//       logUpdate.clear();
//       return;
//     }

//     // persist the output
//     logUpdate.done();

//     // show errors
//     if (err) {
//       const errorCount = err.errors ? err.errors.length : 0;

//       if (errorCount > 0) {
//         const count = indentString(chalk.red.bold(`Found ${errorCount} error${errorCount > 1 ? 's' : ''}`), 1);
//         const details = err.errors
//           .map(error => {
//             debugLog(`[CLI] Exited with an error`, error);

//             return { msg: isDetailedError(error) ? error.details : null, rawError: error };
//           })
//           .map(({ msg, rawError }, i) => {
//             const source: string | Source | undefined = (err.errors[i] as any).source;

//             msg = msg ? chalk.gray(indentString(stripIndent(`${msg}`), 4)) : null;
//             const stack = rawError.stack ? chalk.gray(indentString(stripIndent(rawError.stack), 4)) : null;

//             if (source) {
//               const sourceOfError = typeof source === 'string' ? source : source.name;
//               const title = indentString(`${logSymbol.error} ${sourceOfError}`, 2);

//               return [title, msg, stack, stack].filter(Boolean).join('\n');
//             }

//             return [msg, stack].filter(Boolean).join('\n');
//           })
//           .join('\n\n');
//         logUpdate.emit(['', count, details, ''].join('\n\n'));
//       } else {
//         const details = err.details ? err.details : '';
//         logUpdate.emit(`${chalk.red.bold(`${indentString(err.message, 2)}`)}\n${details}\n${chalk.grey(err.stack)}`);
//       }
//     }

//     logUpdate.done();

//     printLogs();
//   }
// }

// const render = tasks => {
//   for (const task of tasks) {
//     task.subscribe(
//       event => {
//         if (event.type === 'SUBTASKS') {
//           render(task.subtasks);
//           return;
//         }

//         if (event.type === 'DATA') {
//           logUpdate.emit(chalk.dim(`${event.data}`));
//         }
//         logUpdate.done();
//       },
//       err => {
//         logUpdate.emit(err);
//         logUpdate.done();
//       }
//     );
//   }
// };

// export class ErrorRenderer {
//   private tasks: any;

//   constructor(tasks, _options) {
//     this.tasks = tasks;
//   }

//   render() {
//     render(this.tasks);
//   }

//   static get nonTTY() {
//     return true;
//   }

//   end() {}
// }

// class LogUpdate {
//   private stream = process.stdout;
//   // state
//   private previousLineCount = 0;
//   private previousOutput = '';
//   private previousWidth = this.getWidth();

//   emit(...args: string[]) {
//     let output = args.join(' ') + '\n';
//     const width = this.getWidth();

//     if (output === this.previousOutput && this.previousWidth === width) {
//       return;
//     }

//     this.previousOutput = output;
//     this.previousWidth = width;

//     output = wrapAnsi(output, width, {
//       trim: false,
//       hard: true,
//       wordWrap: false,
//     });

//     this.stream.write(ansiEscapes.eraseLines(this.previousLineCount) + output);
//     this.previousLineCount = output.split('\n').length;
//   }

//   clear() {
//     this.stream.write(ansiEscapes.eraseLines(this.previousLineCount));
//     this.previousOutput = '';
//     this.previousWidth = this.getWidth();
//     this.previousLineCount = 0;
//   }

//   done() {
//     this.previousOutput = '';
//     this.previousWidth = this.getWidth();
//     this.previousLineCount = 0;
//   }

//   private getWidth() {
//     const { columns } = this.stream;

//     if (!columns) {
//       return 80;
//     }

//     return columns;
//   }
// }

// const logUpdate = new LogUpdate();
