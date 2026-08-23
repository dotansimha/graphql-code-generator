---
'@graphql-codegen/plugin-helpers': patch
'@graphql-codegen/cli': patch
---

Fix profiler output not being written to the filesystem in watch mode (`--profile --watch`)

The profiler trace was only written on the non-watch code path, after the watch-mode early return, so a profiled watch session never produced a `codegen-*.json` file.

The profiler now writes a fresh trace file after the initial run and after every rebuild, with each file containing only that run's events. A failed rebuild does not produce a trace and its events are discarded so they don't leak into the next successful run.

The `Profiler` now owns its own trace lifecycle: a new `clear()` method starts a new trace, and a new `outputName` property provides the filename for the current trace (`null` for the noop profiler). Filename generation was removed from `CodegenContext` (the `profilerOutput` field and `rotateProfilerOutput()` no longer exist).
