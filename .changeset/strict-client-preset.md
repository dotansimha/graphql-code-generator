---
'@graphql-codegen/client-preset': patch
---

Fix type errors under `strict: true`. The preset now throws a clear error when `schemaAst` is missing from the preset options, and the babel plugin throws when a file has no filename. Both cases used to crash later with a less clear error. Generated output is unchanged.
