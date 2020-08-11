# @graphql-codegen/typescript-urql

## 2.0.1

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8

## 2.0.0

### Major Changes

- 7f2bf153: Prefer generating React Hooks over React data components by default

  ## Breaking Changes

  The default configuration for this plugins has changed to:

  ```yaml
  config:
    withHooks: true
    withComponent: false
  ```

  If you are using the generated Component from that plugin, you can turn it on by adding `withComponent: true` to your configuration.

### Patch Changes

- Updated dependencies [4266a15f]
  - @graphql-codegen/visitor-plugin-common@1.17.12
