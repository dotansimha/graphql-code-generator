import { getLogger } from './utils/logger';

let queue: Array<{
  message: string;
  meta?: any[];
}> = [];

export function debugLog(message: string, ...meta: any[]) {
  if (process.env.DEBUG !== undefined) {
    queue.push({
      message,
      meta
    });
  }
}

export function printLogs() {
  if (process.env.DEBUG !== undefined) {
    queue.forEach(log => {
      getLogger().info(log.message, ...log.meta);
    });
    resetLogs();
  }
}

export function resetLogs() {
  queue = [];
}
