---
'@graphql-codegen/visitor-plugin-common': patch
---

Update @graphql-tools/relay-operation-optimizer package;

- Previously that package used relay-compiler@12 which has graphql v15 as a peer dependency and it was causing peer dependency warnings if user installs a different version of `graphql` package. Now we forked and released v12 under a different name and removed version range for `graphql` in `peerDependencies` of `relay-compiler`
