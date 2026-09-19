import { buildCodegenConfig } from './cli/index.js';

/**
 * Entry point for the `generate:{cjs,esm}` scripts, which run this package through
 * the CLI binary the way the rest of `dev-test/*` does, so the `dev-tests` CI job
 * covers it too.
 *
 * The config itself lives in `cli/index.ts` so the programmatic `start` script and
 * this file cannot drift apart.
 */
export default buildCodegenConfig(process.cwd());
