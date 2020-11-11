import { isBrowser, isNode } from './is-browser';

export function cliError(err: any, exitOnError = true) {
  let msg: string;

  if (err instanceof Error) {
    msg = err.message || err.toString();
  } else if (typeof err === 'string') {
    msg = err;
  } else {
    msg = JSON.stringify(err);
  }

  // eslint-disable-next-line no-console
  console.error(msg);

  if (exitOnError && isNode) {
    process.exit(1);
  } else if (exitOnError && isBrowser) {
    throw err;
  }
}
