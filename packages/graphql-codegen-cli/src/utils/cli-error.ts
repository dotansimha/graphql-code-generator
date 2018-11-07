export function cliError(err: any, exitOnError = true) {
  let msg: string;

  if (err instanceof Error) {
    msg = err.message || err.toString();
  } else if (typeof err === 'string') {
    msg = err;
  } else {
    msg = JSON.stringify(err);
  }

  console['error'](msg);

  if (exitOnError) {
    process.exit(1);
  }

  return;
}
