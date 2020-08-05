# @graphql-codegen/typed-document-node

## 1.17.8
### Patch Changes

- 4266a15f: Allow this plugin to work with `documentMode: graphqlTag` correctly.
  
  Added validation for preventing `documentMode: string` because it's not supported in this plugin.
- Updated dependencies [4266a15f]
  - @graphql-codegen/visitor-plugin-common@1.17.12
