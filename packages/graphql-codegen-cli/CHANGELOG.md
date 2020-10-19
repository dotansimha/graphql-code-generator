# @graphql-codegen/cli

## 1.18.0

### Minor Changes

- ceb9fe0c: Changes watch mode to not use polling by default and adds configurable override

### Patch Changes

- 186962c9: Use `fs.statSync` when creating custom require instead of `path.extname`

## 1.17.10

### Patch Changes

- 2900ee29: Check the error code instead of the error message to determine if a package wasn't found

## 1.17.9

### Patch Changes

- e7d56e32: fix issues with init command and missing versions
- 398b094b: Load user provided things relative to the config
- Updated dependencies [da8bdd17]
  - @graphql-codegen/plugin-helpers@1.17.9

## 1.17.8

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
- Updated dependencies [ac067ea0]
  - @graphql-codegen/core@1.17.8
  - @graphql-codegen/plugin-helpers@1.17.8
