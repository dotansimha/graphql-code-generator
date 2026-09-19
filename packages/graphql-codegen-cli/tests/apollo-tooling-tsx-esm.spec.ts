import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { versionInfo } from 'graphql';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const projectDir = join(repoRoot, 'dev-test', 'apollo-tooling');
const tsxBin = join(projectDir, 'node_modules', '.bin', 'tsx');
const cliEsmDist = join(repoRoot, 'packages', 'graphql-codegen-cli', 'dist', 'esm', 'index.js');

/**
 * Reproduces https://github.com/dotansimha/graphql-code-generator/issues/10970.
 *
 * `dev-test/apollo-tooling` drives codegen programmatically from an ESM config run
 * through `tsx` (its `start` script is `tsx cli/index.ts`), using the CJS-only
 * `near-operation-file-preset`. Under `tsx`, `import 'graphql'` resolves to
 * `graphql/index.mjs` while the preset's `require('graphql')` resolves to
 * `graphql/index.js`, so two distinct `graphql@17` module instances end up in the
 * same process.
 *
 * The preset then calls `isUsingTypes()` from its CJS copy of
 * `@graphql-codegen/plugin-helpers` with a schema built by the *other* instance.
 * `isNonNullType()` is an `instanceof` check, so it returns `false` for a
 * genuine `GraphQLNonNull` from the ESM realm; `getBaseType()` hands back the
 * unwrapped wrapper, whose `.name` is `undefined`; `schema.getType(undefined)`
 * yields `undefined`; and the next nested selection set throws
 * "Unable to find parent type!".
 *
 * Plain Node dedupes the two entry points via the `module-sync` export condition,
 * which is why `dev-test`'s usual `node .../dist/esm/bin.js` lane is unaffected and
 * why this only ever surfaced through the `tsx`-based `start` script.
 */
describe('near-operation-file preset under a tsx-loaded ESM config (#10970)', () => {
  // graphql <17 ships a single CJS build with no `index.mjs`, so a process cannot
  // end up with two instances and the bug cannot exist there. The CI matrix runs
  // this suite against graphql 15/16 too, hence the guard.
  const itOnGraphQL17 = versionInfo.major >= 17 ? it : it.skip;

  itOnGraphQL17(
    'generates dev-test/apollo-tooling without "Unable to find parent type"',
    () => {
      expect(
        existsSync(cliEsmDist),
        `Expected the CLI to be built at ${cliEsmDist}. Run \`pnpm build\` first.`,
      ).toBe(true);
      expect(existsSync(tsxBin), `Expected tsx to be installed at ${tsxBin}.`).toBe(true);

      const result = spawnSync(tsxBin, ['cli/index.ts'], {
        cwd: projectDir,
        encoding: 'utf8',
        // `tsx` shells out to a child Node process; keep the default env so the
        // loader behaves exactly as it does for `pnpm --filter=... start`.
        env: process.env,
      });

      const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

      expect(output).not.toContain('Unable to find parent type');
      expect(result.status).toBe(0);
    },
    120_000,
  );
});
