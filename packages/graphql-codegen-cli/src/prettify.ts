import { debugLog } from './utils/debugging.js';

/**
 * Try to prettify the output.
 * Will skip if prettier is not installed.
 */
export async function prettify(content: string, fileName: string) {
  let prettier: typeof import('prettier');
  try {
    // prettier is an optional dependency
    /* eslint-disable import/no-extraneous-dependencies */
    prettier = await import('prettier');
  } catch (e) {
    debugLog(`Skipping prettier formatting as the prettier npm module is not installed`);
    return content;
  }
  const { format, resolveConfig } = prettier;
  let config: Awaited<ReturnType<typeof resolveConfig>>;
  try {
    config = await resolveConfig(fileName);
  } catch (e) {
    debugLog(`Could not resolve config for ${fileName}`);
    config = {};
  }
  try {
    return format(content, {
      ...config,
      filepath: fileName,
    });
  } catch (e) {
    debugLog(`Could not prettify ${fileName}`);
    return content;
  }
}
