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
  queue.forEach(log => {
    getLogger().info(log.message, ...log.meta);
  });
  resetLogs();
}

export function resetLogs() {
  queue = [];
}
