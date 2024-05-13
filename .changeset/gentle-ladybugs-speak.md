---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-resolvers': patch
---

Add \_ prefix to generated `RefType` in `ResolversInterfaceTypes` and `ResolversUnionTypes` as it is sometimes unused
