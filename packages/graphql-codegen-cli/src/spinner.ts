import * as ora from 'ora';

const instance = ora();
let enabled = true;
let lastMsg: string = null;

interface Spinner {
  start(msg: string): void;
  log(msg: string): void;
  succeed(msg?: string): void;
  fail(msg?: string): void;
  info(msg: string): void;
  warn(msg: string): void;
}

const dummySpinner: Spinner = {
  start() {},
  log() {},
  succeed() {},
  fail() {},
  info() {},
  warn() {}
};

const spinner: Spinner = {
  start(msg: string) {
    instance.start(msg);
    lastMsg = msg;
  },
  log(msg: string) {
    instance.text = msg;
    lastMsg = msg;
  },
  // it persists the message if defined
  succeed(msg?: string) {
    if (msg) {
      instance.succeed(msg);
    }
  },
  fail(msg?: string) {
    instance.fail(msg);
  },
  // it persists the message
  info(msg: string) {
    instance.info(msg);
    this.start(lastMsg);
  },
  // it persists the message
  warn(msg: string) {
    instance.warn(msg);
    this.start(lastMsg);
  }
};

export function disableSpinner() {
  enabled = false;
}

export function getSpinner() {
  if (enabled) {
    return spinner;
  }

  return dummySpinner;
}
