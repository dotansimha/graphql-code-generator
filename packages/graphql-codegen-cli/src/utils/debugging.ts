import { getLogger } from './logger.js';

let queue: Array<{
  message: string;
  meta?: any[];
}> = [];

export function debugLog(message: string, ...meta: any[]) {
  queue.push({
    message,
    meta,
  });
}

export function printLogs() {
  for (const log of queue) {
    getLogger().info(log.message, ...log.meta);
  }
  resetLogs();
}

export function resetLogs() {
  queue = [];
}
