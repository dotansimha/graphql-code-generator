---
'@graphql-codegen/testing': patch
---

Make `validateTs`/`compileTs` type-check under `strict: true`: fall back to the compiler host's script target when the passed options have no `target`, and only compute a diagnostic's line/column when it has a `start` position. Adds `@types/common-tags` as a devDependency.
