import * as ora from 'ora';

const instance = ora();
let lastMsg: string = null;

export default {
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
