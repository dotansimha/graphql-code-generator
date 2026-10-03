---
'@graphql-codegen/visitor-plugin-common': patch
---

Fix type errors in `visitor-plugin-common` (`base-resolvers-visitor`) under `strict: true`:

- `BaseResolversVisitor`'s constructor takes `additionalConfig` as `Partial<TPluginConfig>`, since the visitor fills in the defaults for every key it leaves out.
- `BaseResolversVisitor`'s `ScalarTypeDefinition`, `DirectiveDefinition` and `EnumTypeDefinition` may return `null`, which they already return for skipped federation scalars and directives and for enums without `mappers` or `enumValues`.
- `BaseResolversVisitor.getAbstractMembersType`'s `isTypenameNonOptional` is optional, matching the optional `resolversNonOptionalTypename` flags it is read from.
- `BaseResolversVisitor.defaultMapperType` throws a descriptive error when the `defaultMapper` config is not set.

Generated output is unchanged.
