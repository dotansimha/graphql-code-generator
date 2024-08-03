---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-operations': minor
'@graphql-codegen/typescript': minor
'@graphql-codegen/typescript-resolvers': minor
---

Extend `config.avoidOptions` to support query, mutation and subscription

Previously, `config.avoidOptions.resolvers` was being used to make query, mutation and subscription fields non-optional.
Now, `config.avoidOptions.query`, `config.avoidOptions.mutation` and `config.avoidOptions.subscription` can be used to target the respective types.
