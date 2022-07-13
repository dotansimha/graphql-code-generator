# @graphql-codegen/cli

## 2.8.1

### Patch Changes

- 147e801bf: Add `tslib` as a dependency. See https://github.com/dotansimha/graphql-code-generator/issues/8075

## 2.8.0

### Minor Changes

- d84afec09: Add bin CLI command for running `graphql-code-generator` in ESM mode. You can now use `graphql-codegen-esm` instead of `graphql-codegen`.

  GraphQL Code Generator will continue supporting both ESM and CommonJS in parallel.

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

- 8e44df58b: Add new config option to not exit with non-zero exit code when there are no documents.

  You can use this option in your config:

  ```yaml
  schema: 'schema.graphql'
  documents:
    - 'src/**/*.graphql'
  ignoreNoDocuments: true
  ```

  Alternative you can use the CLI to set this option:

  ```bash
  $ codegen --config-file=config.yml --ignore-no-documents
  ```

### Patch Changes

- e7870ac28: Fix security vulnerability by removing `latest-version` dependency.
- dce40edeb: Allow to disable watch mode from CLI to overwrite the config. Now you can do:

  ```bash
  $ graphql-codegen --watch=false
  ```

- 2e86ecb65: ### Summary

  - Migrate to [`listr2`](https://listr2.kilic.dev)
  - Remove custom renderer for `listr`
  - Remove unused dependencies

  ### Why

  [`listr`](https://github.com/SamVerschueren/listr) is not actively maintained and we have to maintain our custom renderer for it to display errors. Migrating to `listr2` it just works out of the almost similar to how it was working in past and is a actively maintained.

  ### Dev notes

  Big change for us is how errors were collected. In `listr` errors were thrown and were caught in the `end` function of our custom `listr` Renderer but with `listr2` we don't really get `Error` in `end` function always so instead we use the [context](https://listr2.kilic.dev/getting-started/the-concept-of-context) to collect errors from all the tasks and then show them after all the tasks are finished.

- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/core@2.6.0
  - @graphql-codegen/plugin-helpers@2.5.0

## 2.7.0

### Minor Changes

- e050230c0: Remove unnecessary browser check

### Patch Changes

- dfd9f07dc: Fix/multi project
- 2fb1d8b87: Remove unused `tryToBuildSchema` function
- 4dce44263: Bumps `@graphql-tools/url-loader` to the latest `cross-undici-fetch` version that has pinned `undici` to `~5.5.0` in order to fix a bug/breaking-change introduced with `undici@5.6.0` that causes a `GET/HEAD requests cannot have 'body'` error.
  See https://github.com/ardatan/graphql-tools/pull/4559#issue-1292915844 for more details.

## 2.6.4

### Patch Changes

- 92f714278: Revert "Upgrade latest version"

## 2.6.3

### Patch Changes

- c1fe7758a: Remove unused deps
- 52b41e90e: bump latest-version to patch vuln

## 2.6.2

### Patch Changes

- 1e3d37a34: resolve local presets

## 2.6.1

### Patch Changes

- cb9adeb96: Cache validation of documents
- Updated dependencies [cb9adeb96]
  - @graphql-codegen/core@2.5.1
  - @graphql-codegen/plugin-helpers@2.4.1

## 2.6.0

### Minor Changes

- 35566a02c: Use os.cpus to calculate concurrency limit
- acc62e548: fix(deps): remove unnecessary `dotenv` main dependency
- 35566a02c: Async File System

## 2.5.0

### Minor Changes

- 754a33715: Performance Profiler --profile

### Patch Changes

- f13d3554e: #5064 Display detailed errors from CLI
- be7cb3a82: Performance work: resolvers plugins, documents loading
- Updated dependencies [754a33715]
  - @graphql-codegen/core@2.5.0
  - @graphql-codegen/plugin-helpers@2.4.0

## 2.4.0

### Minor Changes

- 4c42e2a71: Performance optimizations in schema and documents loading (shared promises)

## 2.3.1

### Patch Changes

- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [8643b3bf3]
- Updated dependencies [b61dc57cf]
- Updated dependencies [6002feb3d]
  - @graphql-codegen/core@2.4.0
  - @graphql-codegen/plugin-helpers@2.3.2

## 2.3.0

### Minor Changes

- 50c1d3247: feat(cli): export loadCodegenConfig to load codegen configuration files

### Patch Changes

- 04e2d833b: export generateSearchPlaces

## 2.2.2

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/core@2.3.0
  - @graphql-codegen/plugin-helpers@2.3.0

## 2.2.1

### Patch Changes

- Updated dependencies [7c60e5acc]
  - @graphql-codegen/core@2.2.0
  - @graphql-codegen/plugin-helpers@2.2.0

## 2.2.0

### Minor Changes

- 3e38de399: enhance: sort the schema before processing to have more consistent results. You can disable it with `sort: false`.

### Patch Changes

- 3e38de399: fix: handle convertExtensions properly with schema definitions

## 2.1.1

### Patch Changes

- d3c556f8e: fix: do not alter the indentation of documents

## 2.1.0

### Minor Changes

- 39773f59b: enhance(plugins): use getDocumentNodeFromSchema and other utilities from @graphql-tools/utils
- 440172cfe: support ESM

### Patch Changes

- 24185985a: bump graphql-tools package versions
- 72044c1bd: fix: do not alter the indentation of documents loaded via graphql-config
- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/core@2.1.0
  - @graphql-codegen/plugin-helpers@2.1.0

## 2.0.1

### Patch Changes

- edd029e87: fix(graphql-modules-preset): do not parse SDL and use extendedSources that have parsed document already

## 2.0.0

### Major Changes

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

### Patch Changes

- Updated dependencies [b0cb13df4]
- Updated dependencies [d80efdec4]
  - @graphql-codegen/core@2.0.0
  - @graphql-codegen/plugin-helpers@2.0.0

## 1.21.8

### Patch Changes

- e1643e6d4: Fix exception `loader.loaderId is not a function` caused by conflict with an internal dependency of Codegen.

## 1.21.7

### Patch Changes

- 470336a1: don't require plugins for for config if preset provides plugin. Instead the preset should throw if no plugins were provided.
- Updated dependencies [470336a1]
  - @graphql-codegen/plugin-helpers@1.18.8

## 1.21.6

### Patch Changes

- 3b82d1bd: update chokidar

## 1.21.5

### Patch Changes

- dfd25caf: chore(deps): bump graphql-tools versions
- Updated dependencies [dfd25caf]
  - @graphql-codegen/core@1.17.10
  - @graphql-codegen/plugin-helpers@1.18.7

## 1.21.4

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.21.3

### Patch Changes

- 23862e7e: fix(naming-convention): revert and pin change-case-all dependency for workaround #3256
- Updated dependencies [23862e7e]
  - @graphql-codegen/plugin-helpers@1.18.4

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
