import { DetailedError, isDetailedError } from '@graphql-codegen/plugin-helpers';

import { isBrowser, isNode } from './is-browser';

type CompositeError = Error | DetailedError;
type MultipleError = Error & { errors?: CompositeError[] };

function isError(err: any): err is MultipleError {
  return err instanceof Error;
}

export function cliError(err: any, exitOnError = true) {
  let msg: string;

  if (isError(err)) {
    msg = err.message || err.toString();
    if (Array.isArray(err.errors) && err.errors.length) {
      const allErrs = err.errors.map(errItem => {
        let subMsg = errItem.message || errItem.toString();
        if (isDetailedError(errItem)) {
          subMsg = `${subMsg} for "${errItem.source}"${errItem.details}`;
        }
        return subMsg;
      });
      msg = `${msg}\n${allErrs.join("\n")}`;
    }
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
