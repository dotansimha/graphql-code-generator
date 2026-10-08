---
'@graphql-codegen/cli': patch
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript': patch
'@graphql-codegen/client-preset': patch
'@graphql-codegen/testing': patch
'@graphql-codegen/graphql-modules-preset': patch
---

Build with `strict: true`, which changes these emitted type declarations:

- `@graphql-codegen/cli`: `mkdirp` returns `Promise<string | undefined>`, and the `require` (`-r`) CLI option's `default` is typed `never[]` instead of `any[]`.
- `@graphql-codegen/visitor-plugin-common`: `BaseResolversVisitor` and `BaseTypesVisitor` `SchemaDefinition()`/`SchemaExtension()` return `null` instead of `any`.
- `@graphql-codegen/visitor-plugin-common`: `BaseSelectionSetProcessor.typeCache` is keyed by `Location | undefined`.
- `@graphql-codegen/visitor-plugin-common`: `SelectionSetToObject.buildSelectionSet` returns `typeInfo` as `{ name: string; type: string } | null`.
- `@graphql-codegen/visitor-plugin-common`: `getPossibleTypes` accepts `null` as the type, which graphql 15's `schema.getType()` can return.
- `@graphql-codegen/visitor-plugin-common`: `removeDescription` returns nodes with `description: undefined` instead of `any`.
- `@graphql-codegen/typescript`: `TsIntrospectionVisitor`'s constructor takes `pluginConfig` as `TypeScriptPluginConfig | undefined`, `DirectiveDefinition()` returns `null` and `ObjectTypeDefinition()` returns `string | null`.
- `@graphql-codegen/client-preset`: the babel preset accepts `options` as `ClientBabelPresetOptions | null | undefined`.
- `@graphql-codegen/testing`: `mockGraphQLServer` returns `nock.Scope | null`.
- `@graphql-codegen/graphql-modules-preset`: a schema without `extensions` (graphql 15) throws the "requires to use GraphQL SDL" error instead of a `TypeError`.

Generated output is unchanged.
