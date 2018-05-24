import * as moment from 'moment';
import * as winston from 'winston';
import { Logger } from 'winston';

export const logger = new Logger({
  transports: [
    new winston.transports.Console({
      timestamp: () => {
        return moment().format('HH:mm:ss.SSS');
      },
      level: 'info',
      colorize: true,
      formatter: function(options) {
        return (
          `${options.timestamp()} - ` +
          `${winston.config.colorize(options.level)}: ` +
          `${options.message ? options.message : ''}` +
          `${options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : ''}`
        );
      }
    })
  ]
});
