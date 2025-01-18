---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-resolvers': patch
---

Fix generateInternalResolversIfNeeded.\_\_resolveReference making the resolver required

`__resolveReference`'s default behaviour when not declared is to pass the ref to subsequent resolvers i.e. becoming the `parent`. So, it means we don't have to make this resolver required.

This patch makes `__resolveReference` optional when `generateInternalResolversIfNeeded.__resolveReference` is set to true.
