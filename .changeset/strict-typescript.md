---
'@graphql-codegen/typescript': patch
'@graphql-codegen/visitor-plugin-common': patch
---

Fix type errors in `typescript` under `strict: true` by typing the shared visitor methods it overrides:

- `@graphql-codegen/visitor-plugin-common`: adds `NormalizedDeclarationKindConfig` (every declaration kind set), used by `normalizeDeclarationKind`, `DEFAULT_DECLARATION_KINDS` and `ParsedTypesConfig.declarationKind`. `BaseTypesVisitor`'s `NamedType`, `ListType`, `FieldDefinition`, `InputValueDefinition` and `UnionTypeDefinition` have typed visitor params (`key` and `parent` are required, since the visitor always passes them), and `ObjectTypeDefinition`, `EnumTypeDefinition` and `DirectiveDefinition` may return `null`.
- `@graphql-codegen/typescript`: skips document files without a `document` when collecting introspection types, types the `TsVisitor` visitor params, and `TsVisitor.EnumTypeDefinition` may return `null` like the introspection visitor's override.

Generated output is unchanged.
