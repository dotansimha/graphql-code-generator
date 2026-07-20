---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-operations': patch
---

Fix issues when `extractAllFieldsToTypes=true` and `@defer` are used, then duplicate types may be
generated
