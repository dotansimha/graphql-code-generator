/**
 * Poor mans ESM detection.
 * Looking at this and you have a better method?
 * Send a PR.
 */
export const isESMModule = (typeof __dirname === 'string') === false;
