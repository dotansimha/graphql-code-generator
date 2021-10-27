# @graphql-codegen/core

## 2.3.0

### Minor Changes

- 97ddb487a: feat: GraphQL v16 compatibility

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/plugin-helpers@2.3.0

## 2.2.0

### Minor Changes

- 7c60e5acc: feat(core): ability to skip some specific validation rules with skipDocumentsValidation option

### Patch Changes

- Updated dependencies [7c60e5acc]
  - @graphql-codegen/plugin-helpers@2.2.0

## 2.1.0

### Minor Changes

- 39773f59b: enhance(plugins): use getDocumentNodeFromSchema and other utilities from @graphql-tools/utils
- 440172cfe: support ESM

### Patch Changes

- 24185985a: bump graphql-tools package versions
- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/plugin-helpers@2.1.0

## 2.0.0

### Major Changes

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

### Patch Changes

- d80efdec4: Removed `typescript-compatiblity` since it's no longer maintained. Please migrate your codebase to use the latest output of codegen.
- Updated dependencies [b0cb13df4]
  - @graphql-codegen/plugin-helpers@2.0.0

## 1.17.10

### Patch Changes

- dfd25caf: chore(deps): bump graphql-tools versions
- Updated dependencies [dfd25caf]
  - @graphql-codegen/plugin-helpers@1.18.7

## 1.17.9

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.17.8

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- ac067ea0: Filter `prepend` and `append` coming from plugins, make sure not to add empty lines when not needed
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/plugin-helpers@1.17.8
