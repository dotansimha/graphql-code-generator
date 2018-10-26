import * as ora from 'ora';

const spinner = ora();
let lastMsg: string = null;

export function logWithSpinner(msg: string) {
  if (lastMsg) {
    spinner.stop();
  }
  spinner.text = msg;
  lastMsg = msg;
  spinner.start();
}

export function succeedSpinner(msg?: string) {
  if (msg) {
    spinner.succeed(msg);
  } else {
    spinner.stop();
  }
  lastMsg = null;
}

export function failSpinner(text?: string) {
  spinner.fail(text);
  lastMsg = null;
}

export function stopSpinner(persist?: boolean) {
  if (lastMsg && persist !== false) {
    spinner.stopAndPersist(lastMsg);
  } else {
    spinner.stop();
  }
  lastMsg = null;
}

export function pauseSpinner() {
  spinner.stop();
}

export function resumeSpinner() {
  spinner.start();
}
