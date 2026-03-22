---
'@graphql-codegen/typed-document-node': major
'@graphql-codegen/gql-tag-operations': major
'@graphql-codegen/visitor-plugin-common': major
'@graphql-codegen/typescript-document-nodes': major
'@graphql-codegen/typescript-operations': major
'@graphql-codegen/typescript': major
'@graphql-codegen/typescript-resolvers': major
'@graphql-codegen/graphql-modules-preset': major
'@graphql-codegen/plugin-helpers': major
'@graphql-codegen/cli': major
'@graphql-codegen/client-preset': major
---

BREAKING CHANGE: Update deps to latest, some only support ESM

Node 20 support is dropped in this release.
Node 22 comes with `require()` support for ESM, which means it's easier to integrate ES modules into applications. Therefore, it is safe to start using ESM-only packages.

If you are a user, please upgrade to Node 22.
If you are a lib maintainer and see ESM vs CJS issues when running Jest tests, try using Vitest.
