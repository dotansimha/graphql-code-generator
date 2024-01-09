---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-operations': minor
---

fix: out-of-memory crash (fixes #7720)
perf: implement a caching mechanism that makes sure the type originating at the same location is never generated twice, as long as the combination of selected fields and possible types matches
feat: implement `extractAllFieldsToTypes: boolean`
feat: implement `printFieldsOnNewLines: boolean`
