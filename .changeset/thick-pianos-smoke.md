---
'@graphql-codegen/visitor-plugin-common': major
'@graphql-codegen/typescript-resolvers': major
'@graphql-codegen/plugin-helpers': major
---

Fix `mappers` usage with Federation

`mappers` was previously used as `__resolveReference`'s first param (usually called "reference"). However, this is incorrect because `reference` interface comes directly from `@key` and `@requires` directives. This patch fixes the issue by creating a new `FederationTypes` type and use it as the base for federation entity types when being used to type entity references.

BREAKING CHANGES: No longer generate `UnwrappedObject` utility type, as this was used to support the wrong previously generated type.
