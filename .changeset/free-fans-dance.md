---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-operations': patch
---

Add `printTypeScriptMaybeType` to handle printing TS types, as there are special cases like `any` and `unknown`
