---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-operations': patch
---

Add printTypeScriptType to handle printing TS types, as there are special cases like `any` and `unknown`
