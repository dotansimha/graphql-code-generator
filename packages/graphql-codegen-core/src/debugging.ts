import { getLogger } from './utils/logger';

export function debugLog(message: string, ...meta: any[]) {
  if (process.env.DEBUG !== undefined) {
    getLogger().info(message, ...meta);
  }
}
