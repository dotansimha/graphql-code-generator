---
'@graphql-codegen/typescript-operations': major
'@graphql-codegen/typescript': major
'@graphql-codegen/client-preset': major
---

BREAKING CHANGE: `typescript` plugin no longer generates `Exact` utility type. Instead, `typescript-operations` generates said utility type for every file it creates. This is because it is used _only_ for `Variables`, so we only need to generate it once for every generated operation file.
