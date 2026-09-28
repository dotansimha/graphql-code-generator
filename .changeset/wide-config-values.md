---
'@graphql-codegen/visitor-plugin-common': patch
---

Type `getConfigValue`'s `value` parameter as `T | null | undefined`, so the result is non-nullable when a non-nullable default is given.
