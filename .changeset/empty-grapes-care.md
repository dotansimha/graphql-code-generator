---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-operations': patch
'@graphql-codegen/typescript': patch
'@graphql-codegen/typescript-resolvers': patch
'@graphql-codegen/client-preset': patch
---

Revert default ID scalar input type to string

We changed the ID Scalar input type from `string` to `string | number` in the latest major version of `typescript` plugin. This causes issues for server plugins (e.g. typescript-resolvers) that depends on `typescript` plugin. This is because the scalar type needs to be manually inverted on setup which is confusing.
