---
'@graphql-codegen/testing': patch
---

Anchor `validateTs` / `compileTs` module resolution at the directory of the test being run.

The file these helpers type-check exists only in memory, but TypeScript still needs a real directory
to anchor Node module resolution to. The compiler host reported `''` as the current directory, so
nothing resolved — and every resulting diagnostic was swallowed by the blanket `Cannot find module`
filter, leaving generics to silently degrade to `never` with only a confusing downstream overload
error to show for it.

`process.cwd()` is not a usable anchor either: it is the repo root, and under pnpm's isolated layout
a package's dependencies live in that package's own `node_modules`. The directory of the running
test file is, so it is taken from `expect.getState().testPath`; calling these helpers outside a
vitest test now throws instead of silently resolving from the wrong place.

`vitest` is now declared as a peer dependency rather than relied on as a phantom one — `src/index.ts`
already imported it, and `validateTs` now does too.

This is an internal test-utility fix; no exported signature changes.
