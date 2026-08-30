---
'@graphql-codegen/cli': minor
'@graphql-codegen/plugin-helpers': minor
---

Add `contentComparison?: 'cache-first' | 'disk'` to control disk-vs-cache write
comparison in watch mode.

In watch mode the CLI caches the hash of the content it last wrote per file and
compares new output against that cached hash to skip redundant writes. This
assumes generated output is a pure function of the codegen inputs. An output whose
content depends on the file's existing content (e.g. a preset that reads the file
and rewrites part of it) breaks that assumption: if the file is changed on disk and
codegen regenerates content identical to a previous run, the cached hash still
matches and the write is skipped, so the on-disk change is never corrected.

`contentComparison: 'disk'` opts an output into comparing the generated content
against the file on disk instead of the in-memory record of what codegen last
wrote, so the file is rewritten when it was changed externally. It can be set:

- by a preset, on the `GenerateOptions` it returns from `buildGeneratesSection`, or
- on the output config (`generates[output].contentComparison`) for any output,
  including plain plugin outputs without a preset.

When both are present, the preset's value takes precedence. The default,
`'cache-first'`, keeps the existing in-memory-cache behaviour for outputs that are
a pure function of their inputs.
