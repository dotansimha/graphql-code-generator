# @graphql-codegen/plugin-helpers

## 2.3.0

### Minor Changes

- 97ddb487a: feat: GraphQL v16 compatibility

## 2.2.0

### Minor Changes

- 7c60e5acc: feat(core): ability to skip some specific validation rules with skipDocumentsValidation option

## 2.1.1

### Patch Changes

- 6470e6cc9: fix(plugin-helpers): remove unnecessary import
- 35199dedf: Fix module not found bug in resolveExternalModuleAndFn

## 2.1.0

### Minor Changes

- 39773f59b: enhance(plugins): use getDocumentNodeFromSchema and other utilities from @graphql-tools/utils
- 440172cfe: support ESM

### Patch Changes

- 24185985a: bump graphql-tools package versions

## 2.0.0

### Major Changes

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

## 1.18.8

### Patch Changes

- 470336a1: don't require plugins for for config if preset provides plugin. Instead the preset should throw if no plugins were provided.

## 1.18.7

### Patch Changes

- dfd25caf: chore(deps): bump graphql-tools versions

## 1.18.6

### Patch Changes

- 637338cb: fix: make lifecycle hooks definition a partial

## 1.18.5

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error

## 1.18.4

### Patch Changes

- 23862e7e: fix(naming-convention): revert and pin change-case-all dependency for workaround #3256

## 1.18.3

### Patch Changes

- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention

## 1.18.2

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies

## 1.18.1

### Patch Changes

- eaf45d1f: fix issue with inline fragment without typeCondition

## 1.18.0

### Minor Changes

- 857c603c: Adds the --errors-only flag to the cli to print errors only.

## 1.17.9

### Patch Changes

- da8bdd17: Allow hooks to be defined as partial object

## 1.17.8

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
