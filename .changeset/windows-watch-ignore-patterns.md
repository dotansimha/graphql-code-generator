---
'@graphql-codegen/cli': patch
---

Fix watch mode never ignoring its own generated output files on Windows.

The `ignore` glob patterns passed to `@parcel/watcher` when starting watch mode were
built from `path.relative()`/`path.join()`, which produce backslash-separated paths on
Windows. `@parcel/watcher` (like most glob-matching libraries) expects glob patterns
with POSIX `/` separators regardless of platform, so on Windows these patterns never
matched anything: the CLI's own generated output files were never excluded from the
watcher's file-change detection.
