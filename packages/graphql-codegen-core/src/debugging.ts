import { logger } from './utils/logger';

export function debugLog(message: string, ...meta: any[]) {
  if (process.env.DEBUG !== undefined) {
    logger.info(message, ...meta);
  }
}
