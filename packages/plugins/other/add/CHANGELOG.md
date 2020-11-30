# @graphql-codegen/add

## 2.0.2

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/plugin-helpers@1.18.2

## 2.0.1

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- ac067ea0: Fix for empty lines added by add plugin
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/plugin-helpers@1.17.8

## 2.0.0

### Major Changes

- bc6e5c08: Update plugin configuration API to use object only (`string` is no longer supported)

  ## Migration Notes

  #### Before

  ```yaml
  plugins:
    - add: 'some string'
  ```

  #### After

  ```yaml
  plugins:
    - add:
        content: 'some string'
  ```
