# @graphql-codegen/typed-document-node

## 1.17.9

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8

## 1.17.8

### Patch Changes

- 4266a15f: Allow this plugin to work with `documentMode: graphqlTag` correctly.

  Added validation for preventing `documentMode: string` because it's not supported in this plugin.

- Updated dependencies [4266a15f]
  - @graphql-codegen/visitor-plugin-common@1.17.12
