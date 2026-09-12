---
'@graphql-codegen/client-preset': minor
---

Add `skipIndexFile` preset config option to `client-preset` to allow disabling generation of the `index.ts` barrel file that re-exports the other generated files. Defaults to `false` (unchanged behavior); set to `true` to skip generating `index.ts`, for example when your project avoids barrel files for tree-shaking or lint rule reasons.
