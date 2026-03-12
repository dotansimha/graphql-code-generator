---
'@graphql-codegen/visitor-plugin-common': major
'@graphql-codegen/typescript': major
---

BREAKING CHANGE: Remove unused utility types from `typescript` plugin as they were previously used for `typescript-operations` plugin:

- `MakeOptional`
- `MakeMaybe`
- `MakeEmpty`
- `Incremental`

BREAKING CHANGE: Remove `getRootTypeNames` function because it's available in `@graphql-utils/tools` and not used anywhere
