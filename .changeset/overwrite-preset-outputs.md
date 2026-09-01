---
'@graphql-codegen/cli': patch
'@graphql-codegen/plugin-helpers': patch
---

Fix `overwrite` being ignored for preset-based `generates` outputs.

A `generates` entry that used a preset and set `overwrite` (e.g.
`overwrite: { removeStaleFiles: false }`) had that setting silently ignored, so in
watch mode its generated files could still be deleted as stale.

The CLI resolved `overwrite` per generated file by looking the file's path up in
`config.generates`. That fails for a preset: its `generates` entry is keyed by the
preset's `baseOutputDir`, not by any generated file's path (and a preset can emit
files outside that directory), and the lookup additionally required a `plugins` key
that preset entries don't have. Both cases fell through to the global `config.overwrite`
(default `true`).

The entry's `overwrite` is now carried on each `FileOutput` (alongside `hooks` and
`contentComparison`) when outputs are built, and honored per file — including for
files a preset emits outside its `baseOutputDir`.
