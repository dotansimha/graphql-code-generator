import { fetch } from '@whatwg-node/fetch';

/**
 * Fetches the version directly from the registry instead of depending on
 * an ESM only module as latest-version does.
 * @param packageName
 */
export async function getLatestVersion(packageName: string): Promise<string> {
  return fetch(`https://unpkg.com/${packageName}/package.json`)
    .then(res => res.json())
    .then(pkg => pkg.version);
}
