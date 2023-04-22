---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-resolvers': minor
---

Use generic to simplify ResolversUnionTypes

This follows the `ResolversInterfaceTypes`'s approach where the `RefType` generic is used to refer back to `ResolversTypes` or `ResolversParentTypes` in cases of nested Union types
