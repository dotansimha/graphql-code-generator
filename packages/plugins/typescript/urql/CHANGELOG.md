# @graphql-codegen/typescript-urql

## 2.0.6

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 2.0.5

### Patch Changes

- 23862e7e: fix(naming-convention): revert and pin change-case-all dependency for workaround #3256
- Updated dependencies [23862e7e]
  - @graphql-codegen/visitor-plugin-common@1.19.1
  - @graphql-codegen/plugin-helpers@1.18.4

## 2.0.4

### Patch Changes

- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/plugin-helpers@1.18.3

## 2.0.3

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/plugin-helpers@1.18.2

## 2.0.2

### Patch Changes

- f603b8f8: Support unnamed queries in operation visitors
- 65f92288: fix extension validation
- Updated dependencies [d2cde3d5]
- Updated dependencies [89a6aa80]
- Updated dependencies [f603b8f8]
- Updated dependencies [da8bdd17]
  - @graphql-codegen/visitor-plugin-common@1.17.15
  - @graphql-codegen/plugin-helpers@1.17.9

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
