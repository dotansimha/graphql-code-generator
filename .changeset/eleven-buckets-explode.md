---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/gql-tag-operations': patch
'@graphql-codegen/typescript-oclif': patch
'@graphql-codegen/typescript-resolvers': patch
'@graphql-codegen/gql-tag-operations-preset': patch
'@graphql-codegen/graphql-modules-preset': patch
'@graphql-codegen/near-operation-file-preset': patch
---

Revert breaking change for Next.js applications that are incapable of resolving an import with a `.js` extension.
