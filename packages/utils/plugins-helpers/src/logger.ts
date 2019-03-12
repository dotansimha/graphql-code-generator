import { dummyLogger, Logger } from 'ts-log';

let logger: Logger;

export function getLogger(): Logger {
  return logger || dummyLogger;
}

useWinstonLogger();

export function setLogger(newLogger: Logger) {
  logger = newLogger;
}

export function setSilentLogger() {
  logger = dummyLogger;
}

export function useWinstonLogger() {
  if (logger && logger.levels) {
    return;
  }

  logger = console;
}
