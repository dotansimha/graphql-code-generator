---
"@graphql-codegen/cli": patch
"@graphql-codegen/client-preset": patch
"@graphql-codegen/core": patch
"@graphql-codegen/gql-tag-operations": patch
"@graphql-codegen/graphql-modules-preset": patch
"@graphql-codegen/plugin-helpers": patch
"@graphql-codegen/schema-ast": patch
"@graphql-codegen/typescript-resolvers": patch
"@graphql-codegen/visitor-plugin-common": patch
---

Require @graphql-tools/utils 12.0.1 or later, which fixes the mergeDeep prototype pollution vulnerability (GHSA-7mx3-vvmw-hjmv).
