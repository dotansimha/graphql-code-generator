---
'@graphql-codegen/visitor-plugin-common': patch
---

Fix type errors in `visitor-plugin-common` (`base-types-visitor`) under `strict: true`:

- `BaseTypesVisitor`'s constructor takes `additionalConfig` as `Partial<TPluginConfig>`, since the visitor fills in the defaults for every key it leaves out.
- `BaseTypesVisitor` handles input objects, objects, interfaces, unions and enums without `fields`, `types`, `values` or `description` by treating them as empty, instead of throwing.

Generated output is unchanged.
