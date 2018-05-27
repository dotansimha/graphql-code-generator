import { logger } from './utils/logger';

export function debugLog(...args) {
  if (process.env.DEBUG !== undefined) {
    logger.info(...args);
  }
}
