import * as winston from 'winston';
import { createLogger } from 'winston';

export const logger = createLogger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize({ level: true }),
        winston.format.timestamp({
          format: 'HH:mm:ss.SSS'
        }),
        winston.format.printf(info => {
          return `${info.timestamp} - ${info.level}: ${info.message ? info.message : ''} ${
            info.meta && Object.keys(info.meta).length ? JSON.stringify(info.meta) : ''
          }`;
        })
      )
    })
  ]
});
