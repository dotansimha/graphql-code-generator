import { buildCodegenConfig } from './cli/config.ts';

/**
 * Entry point for the `generate:{cjs,esm}` scripts, which run this package through
 * the CLI binary the way the rest of `dev-test/*` does, so the `dev-tests` CI job
 * covers it too.
 *
 * The config itself lives in `cli/config.ts`, shared with the programmatic `start`
 * entry point in `cli/index.ts` so the two cannot drift apart.
 */
export default buildCodegenConfig(process.cwd());
