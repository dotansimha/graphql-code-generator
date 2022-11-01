# @graphql-codegen/core

## 2.6.3

### Patch Changes

- [#8525](https://github.com/dotansimha/graphql-code-generator/pull/8525) [`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127) Thanks [@charlypoly](https://github.com/charlypoly)! - remove `DetailledError`, not supported by Listr renderer

- Updated dependencies [[`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127)]:
  - @graphql-codegen/plugin-helpers@2.7.2

## 2.6.2

### Patch Changes

- [#8207](https://github.com/dotansimha/graphql-code-generator/pull/8207) [`6c7d3e54b`](https://github.com/dotansimha/graphql-code-generator/commit/6c7d3e54bb3cb53d8bbbd25e31c45b66f29f4640) Thanks [@renovate](https://github.com/apps/renovate)! - ### Dependencies Updates

  - Updated dependency ([`@graphql-tools/schema@^9.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/schema/v/^9.0.0)) (was `^8.5.0`, in `dependencies`)

## 2.6.1

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189) [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with `moduleResolution` `node16` or `nodenext`

- Updated dependencies [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f)]:
  - @graphql-codegen/plugin-helpers@2.6.2

## 2.6.0

### Minor Changes

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/plugin-helpers@2.5.0

## 2.5.1

### Patch Changes

- cb9adeb96: Cache validation of documents
- Updated dependencies [cb9adeb96]
  - @graphql-codegen/plugin-helpers@2.4.1

## 2.5.0

### Minor Changes

- 754a33715: Performance Profiler --profile

### Patch Changes

- Updated dependencies [754a33715]
  - @graphql-codegen/plugin-helpers@2.4.0

## 2.4.0

### Minor Changes

- b61dc57cf: feat(core): add graphql@16 in peer dependencies

### Patch Changes

- 8643b3bf3: Add GraphQL 16 as a peerDependency
- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [6002feb3d]
  - @graphql-codegen/plugin-helpers@2.3.2

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
