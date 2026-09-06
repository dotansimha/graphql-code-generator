---
'@graphql-codegen/cli': patch
---

Fix watch mode's generated `ignore` glob patterns using the platform path separator (`\` on Windows), which `@parcel/watcher` never matched, so generated output files were watched (and could re-trigger builds) instead of being ignored. Ignore patterns are now always forward-slash, as `@parcel/watcher` expects.

Also fixes the test suite's `TempDir.clean()` helper on Windows, where `rimraf.sync()` rejected its own glob-style cleanup pattern as containing illegal path characters; now passes `{ glob: true }`. This is a test-only change (`tests/utils.ts` is not part of the published package) included here since it was needed to get the suite green on Windows alongside the watch-mode fix.
