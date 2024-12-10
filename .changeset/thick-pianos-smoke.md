---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-resolvers': patch
'@graphql-codegen/plugin-helpers': patch
---

Fix `mappers` usage with Federation

`mappers` was previously used as `__resolveReference`'s first param (usually called "reference"). However, this is incorrect because `reference` interface comes directly from `@key` and `@requires` directives. This patch fixes the issue by creating a new `FederationTypes` type and use it as the base for federation entity types when being used to type entity references
