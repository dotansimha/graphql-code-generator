---
'@graphql-codegen/cli': minor
---

PoC: run the elements of a `generates` array as sequential stages of the same output file. All stages share one `pluginContext.output`: `output.files[filename]` holds the content, prepend and append of the stages run so far, and the `meta` returned by plugins is merged into `output`. The file is written as the sorted prepend lines, then the content of all stages, then the append lines. The `schema`/`documents` a stage's plugins return are handed to later stages
