import * as fs from 'fs';
import packageJson from '../packages/graphql-codegen-cli/package.json' with { type: 'json' };

/**
 * This script extracts the `@graphql-codegen/cli` version ahead of build and publish time,
 * so at runtime, we don't have to import `package.json` file for the package version.
 *
 * Importing a `.json` file is surprisingly hard for a dual ESM/CJS package.
 * The current approach is the simplest.
 *
 * Many alternatives considered:
 * 1. `import {} from '../package.json'` does not work in ESM without import attributes i.e. `with { type: 'json' }`.
 * 2. `createRequire` from `node:module` needs `import.meta.url` which works for ESM, but doesn't work for CJS because it is a syntax error at parse-time.
 * 3. `fs.readFile` reads from `cwd`, which means we need to use `__dirname` or `import.meta.url` as the starting point. `import.meta.url` is a syntax error at parse-time for CJS.
 * 4. Create a shim `.mts` file and dynamically import it at runtime for ESM
 * 5. Use `nodenext` instead of `esnext` for `module` and `moduleResolution`. Maybe a big change?
 * 6. Ship ESM-only. This is a big change.
 */
fs.writeFileSync(
  './packages/graphql-codegen-cli/src/_version.ts',
  `export const version = '${packageJson.version}';`,
  'utf8',
);
