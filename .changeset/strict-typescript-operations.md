---
'@graphql-codegen/typescript-operations': patch
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/plugin-helpers': patch
---

Fix type errors in `typescript-operations` under `strict: true` by widening the shared types it calls into:

- `@graphql-codegen/plugin-helpers`: `Types.ComplexPluginOutput`'s `prepend` and `append` now accept `null` items. Core already skipped them.
- `@graphql-codegen/visitor-plugin-common`: `DeclarationBlock.withComment` accepts `undefined`, `parseEnumValues`'s `mapOrStr` is optional (it already defaulted to `{}`), `ImportSource.namespace` accepts `null`, and `optimizeOperations`'s `includeFragments` is optional.
- `@graphql-codegen/typescript-operations`: skips document files without a `document`, and no longer throws when called without the plugin info argument.

Generated output is unchanged.
