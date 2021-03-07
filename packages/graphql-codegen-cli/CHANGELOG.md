# @graphql-codegen/cli

## 1.21.2

### Patch Changes

- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [29b75b1e]
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.21.0

### Minor Changes

- dfef1c7c: feat(cli): pass parameters to loaders from plugin config

## 1.20.1

### Patch Changes

- f86365c2: Dependencies cleanup

## 1.20.0

### Minor Changes

- 0e9ddb5a: Add `merge` (`<<`) syntax for `yaml` configurations

### Patch Changes

- bff3fa88: CLI with watch option will reload using new config on change
- 9ebf1877: Fix wrong MODULE_NOT_FOUND for missing dependencies
- aa955f15: fix hooks as single function

## 1.19.4

### Patch Changes

- 920d8e95: Allow loading configuration from package.json file

## 1.19.3

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/core@1.17.9
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.19.2

### Patch Changes

- faa13973: Fix issues with missing sources in loadSchema
- faa13973: fix(cli): use default options of codegen for graphql-config's load methods

## 1.19.1

### Patch Changes

- 4ad0319a: Resolve modules passed through the -r flag relative to the cwd
- 93e49f89: Correctly resolve relative to the cwd
- Updated dependencies [eaf45d1f]
  - @graphql-codegen/plugin-helpers@1.18.1

## 1.19.0

### Minor Changes

- 857c603c: Adds the --errors-only flag to the cli to print errors only.

### Patch Changes

- Updated dependencies [857c603c]
  - @graphql-codegen/plugin-helpers@1.18.0

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
