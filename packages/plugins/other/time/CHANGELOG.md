# @graphql-codegen/time

## 4.0.0

### Major Changes

- [#8885](https://github.com/dotansimha/graphql-code-generator/pull/8885) [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d) Thanks [@n1ru4l](https://github.com/n1ru4l)! - drop Node.js 12 support

### Patch Changes

- Updated dependencies [[`fc79b65d4`](https://github.com/dotansimha/graphql-code-generator/commit/fc79b65d4914fd25ae6bd5d58ebc7ded573a08a5), [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d)]:
  - @graphql-codegen/plugin-helpers@4.0.0

## 3.2.3

### Patch Changes

- [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a) Thanks [@saihaj](https://github.com/saihaj)! - fix the version of `@graphql-codegen/plugin-helpers@3.1.1`

- Updated dependencies [[`307a5d350`](https://github.com/dotansimha/graphql-code-generator/commit/307a5d350643dd065d228b04ef3b4bd70cac0e81)]:
  - @graphql-codegen/plugin-helpers@3.1.1

## 3.2.2

### Patch Changes

- Updated dependencies [[`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`f79a00e8a`](https://github.com/dotansimha/graphql-code-generator/commit/f79a00e8ae073eab426ca08795c924e716123482), [`c802a0c0b`](https://github.com/dotansimha/graphql-code-generator/commit/c802a0c0b775cfabc5ace3e7fb6655540c6c4d84)]:
  - @graphql-codegen/plugin-helpers@3.0.0

## 3.2.1

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189) [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with `moduleResolution` `node16` or `nodenext`

- Updated dependencies [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f)]:
  - @graphql-codegen/plugin-helpers@2.6.2

## 3.2.0

### Minor Changes

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/plugin-helpers@2.5.0

## 3.1.1

### Patch Changes

- 8643b3bf3: Add GraphQL 16 as a peerDependency
- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [6002feb3d]
  - @graphql-codegen/plugin-helpers@2.3.2

## 3.1.0

### Minor Changes

- 440172cfe: support ESM

### Patch Changes

- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/plugin-helpers@2.1.0

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
