---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-resolvers': minor
'@graphql-codegen/plugin-helpers': minor
---

Add `generateInternalResolversIfNeeded` option

This option can be used to generate more correct types for internal resolvers. For example, only generate `__resolveReference` if the federation object has a resolvable `@key`.

In the future, this option can be extended to support other internal resolvers e.g. `__isTypeOf` is only generated for implementing types and union members.
