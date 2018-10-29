import * as winston from 'winston';
import { createLogger } from 'winston';
import { dummyLogger, Logger } from 'ts-log';
import chalk from 'chalk';

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
    // Winston already set
    return;
  }

  const winstonLogger = createLogger({
    transports: [
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp({
            format: 'HH:mm:ss.SSS'
          }),
          winston.format.printf(info => {
            if (info.level === 'error') {
              return chalk.redBright(
                `${info.message || ''}\n${info.meta && Object.keys(info.meta).length ? JSON.stringify(info.meta) : ''}`
              );
            }

            return `${info.timestamp} - ${info.level}: ${info.message ? info.message : ''} ${
              info.meta && Object.keys(info.meta).length ? JSON.stringify(info.meta) : ''
            }`;
          })
        )
      })
    ]
  });

  (winstonLogger as any).trace = winstonLogger.silly.bind(winstonLogger);
  logger = winstonLogger as any;
}
