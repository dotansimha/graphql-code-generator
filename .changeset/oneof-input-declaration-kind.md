---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-operations': patch
---

Fix `typescript-operations` generating invalid `interface` declarations for `@oneOf` inputs when `declarationKind` is `interface` (#10996).

A `@oneOf` input with multiple fields is a union, so it is always generated as a `type` alias; a single-field `@oneOf` input keeps the configured `declarationKind.input`. `typescript` and `typescript-operations` share this rule through the new `getOneOfInputDeclarationKind` export from `@graphql-codegen/visitor-plugin-common`.
