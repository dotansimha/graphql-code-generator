---
'@graphql-codegen/cli': patch
---

Fix watch mode's generated `ignore` glob patterns using the platform path separator (`\` on Windows), which `@parcel/watcher` never matched, so generated output files were watched (and could re-trigger builds) instead of being ignored. Ignore patterns are now always forward-slash, as `@parcel/watcher` expects.
