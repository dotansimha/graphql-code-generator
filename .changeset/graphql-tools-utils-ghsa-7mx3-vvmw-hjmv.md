---
'@graphql-codegen/cli': patch
'@graphql-codegen/core': patch
'@graphql-codegen/plugin-helpers': patch
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/schema-ast': patch
'@graphql-codegen/typescript-resolvers': patch
'@graphql-codegen/gql-tag-operations': patch
'@graphql-codegen/client-preset': patch
'@graphql-codegen/graphql-modules-preset': patch
---

Update `@graphql-tools/utils` to v12 and other `@graphql-tools/*` dependencies to releases that use it, to pick up the fix for [GHSA-7mx3-vvmw-hjmv](https://github.com/advisories/GHSA-7mx3-vvmw-hjmv) (prototype pollution in `mergeDeep`, `@graphql-tools/utils` <= 12.0.0).

`@graphql-codegen/cli` now unwraps the `AggregateError` that newer `@graphql-tools/load` versions throw, so schema and document syntax errors still print the native `GraphQLError` with its file location.
