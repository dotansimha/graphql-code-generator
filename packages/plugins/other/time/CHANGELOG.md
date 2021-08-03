# @graphql-codegen/time

## 3.0.0

### Major Changes

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

### Patch Changes

- Updated dependencies [b0cb13df4]
  - @graphql-codegen/plugin-helpers@2.0.0

## 2.0.2

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/plugin-helpers@1.18.2

## 2.0.1

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/plugin-helpers@1.17.8

## 2.0.0

### Major Changes

- bc6e5c08: Update plugin configuration API to use object only (`string` is no longer supported)

  ## Migration Notes

  This only effects developers who used to override the `format`. You now need to specify it with a key!

  #### Before

  ```yaml
  plugins:
    - time: 'DD-MM-YYYY'
  ```

  #### After

  ```yaml
  plugins:
    - time:
        format: 'DD-MM-YYYY'
  ```

## 1.17.10

### Patch Changes

- ee2b01a3: Fixes for issues with publish command

## 1.17.9

### Patch Changes

- 6cb9c96d: Fixes issues with previous release

## 1.17.8

### Patch Changes

- bccfd28c: Fix issues with adding time to .graphql files
