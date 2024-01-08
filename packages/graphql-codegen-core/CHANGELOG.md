# @graphql-codegen/core

## 4.0.1

### Patch Changes

- [#9640](https://github.com/dotansimha/graphql-code-generator/pull/9640) [`40a29e91e`](https://github.com/dotansimha/graphql-code-generator/commit/40a29e91ea25ed5ad6acb15ccca1767dafbdd7c5) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`tslib@~2.6.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.6.0) (from `~2.5.0`, in `dependencies`)
- Updated dependencies [[`40a29e91e`](https://github.com/dotansimha/graphql-code-generator/commit/40a29e91ea25ed5ad6acb15ccca1767dafbdd7c5)]:
  - @graphql-codegen/plugin-helpers@5.0.2

## 4.0.0

### Major Changes

- [`bb66c2a31`](https://github.com/dotansimha/graphql-code-generator/commit/bb66c2a31985c1375912ccd6b2b02933f313c9c0) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Require Node.js `>= 16`. Drop support for Node.js 14

### Patch Changes

- [#9449](https://github.com/dotansimha/graphql-code-generator/pull/9449) [`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2) Thanks [@n1ru4l](https://github.com/n1ru4l)! - dependencies updates:
  - Updated dependency [`@graphql-tools/schema@^10.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/schema/v/10.0.0) (from `^9.0.0`, in `dependencies`)
  - Updated dependency [`@graphql-tools/utils@^10.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/10.0.0) (from `^9.1.1`, in `dependencies`)
- Updated dependencies [[`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2), [`f46803a8c`](https://github.com/dotansimha/graphql-code-generator/commit/f46803a8c70840280529a52acbb111c865712af2), [`63827fabe`](https://github.com/dotansimha/graphql-code-generator/commit/63827fabede76b2380d40392aba2a3ccb099f0c4), [`bb66c2a31`](https://github.com/dotansimha/graphql-code-generator/commit/bb66c2a31985c1375912ccd6b2b02933f313c9c0)]:
  - @graphql-codegen/plugin-helpers@5.0.0

## 3.1.0

### Minor Changes

- [#8723](https://github.com/dotansimha/graphql-code-generator/pull/8723) [`a3309e63e`](https://github.com/dotansimha/graphql-code-generator/commit/a3309e63efed880e6f74ce6fcbf82dd3d7857a15) Thanks [@kazekyo](https://github.com/kazekyo)! - Introduce a new feature called DocumentTransform.

  DocumentTransform is a functionality that allows you to modify `documents` before they are processed by plugins. You can use functions passed to the `documentTransforms` option to make changes to GraphQL documents.

  To use this feature, you can write `documentTransforms` as follows:

  ```ts
  import type { CodegenConfig } from '@graphql-codegen/cli';

  const config: CodegenConfig = {
    schema: 'https://localhost:4000/graphql',
    documents: ['src/**/*.tsx'],
    generates: {
      './src/gql/': {
        preset: 'client',
        documentTransforms: [
          {
            transform: ({ documents }) => {
              // Make some changes to the documents
              return documents;
            },
          },
        ],
      },
    },
  };
  export default config;
  ```

  For instance, to remove a `@localOnlyDirective` directive from `documents`, you can write the following code:

  ```js
  import type { CodegenConfig } from '@graphql-codegen/cli';
  import { visit } from 'graphql';

  const config: CodegenConfig = {
    schema: 'https://localhost:4000/graphql',
    documents: ['src/**/*.tsx'],
    generates: {
      './src/gql/': {
        preset: 'client',
        documentTransforms: [
          {
            transform: ({ documents }) => {
              return documents.map(documentFile => {
                documentFile.document = visit(documentFile.document, {
                  Directive: {
                    leave(node) {
                      if (node.name.value === 'localOnlyDirective') return null;
                    },
                  },
                });
                return documentFile;
              });
            },
          },
        ],
      },
    },
  };
  export default config;
  ```

  DocumentTransform can also be specified by file name. You can create a custom file for a specific transformation and pass it to `documentTransforms`.

  Let's create the document transform as a file:

  ```js
  module.exports = {
    transform: ({ documents }) => {
      // Make some changes to the documents
      return documents;
    },
  };
  ```

  Then, you can specify the file name as follows:

  ```ts
  import type { CodegenConfig } from '@graphql-codegen/cli';

  const config: CodegenConfig = {
    schema: 'https://localhost:4000/graphql',
    documents: ['src/**/*.tsx'],
    generates: {
      './src/gql/': {
        preset: 'client',
        documentTransforms: ['./my-document-transform.js'],
      },
    },
  };
  export default config;
  ```

### Patch Changes

- [#8879](https://github.com/dotansimha/graphql-code-generator/pull/8879) [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`tslib@~2.5.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.5.0) (from `~2.4.0`, in `dependencies`)
- Updated dependencies [[`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`a118c307a`](https://github.com/dotansimha/graphql-code-generator/commit/a118c307a35bbb97b7cbca0f178a88276032a26c), [`a3309e63e`](https://github.com/dotansimha/graphql-code-generator/commit/a3309e63efed880e6f74ce6fcbf82dd3d7857a15)]:
  - @graphql-codegen/plugin-helpers@4.1.0

## 3.0.0

### Major Changes

- [#8885](https://github.com/dotansimha/graphql-code-generator/pull/8885) [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d) Thanks [@n1ru4l](https://github.com/n1ru4l)! - drop Node.js 12 support

### Patch Changes

- [#8871](https://github.com/dotansimha/graphql-code-generator/pull/8871) [`fc79b65d4`](https://github.com/dotansimha/graphql-code-generator/commit/fc79b65d4914fd25ae6bd5d58ebc7ded573a08a5) Thanks [@B2o5T](https://github.com/B2o5T)! - eslint fixes

- Updated dependencies [[`fc79b65d4`](https://github.com/dotansimha/graphql-code-generator/commit/fc79b65d4914fd25ae6bd5d58ebc7ded573a08a5), [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d)]:
  - @graphql-codegen/plugin-helpers@4.0.0

## 2.6.8

### Patch Changes

- [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a) Thanks [@saihaj](https://github.com/saihaj)! - fix the version of `@graphql-codegen/plugin-helpers@3.1.1`

- Updated dependencies [[`307a5d350`](https://github.com/dotansimha/graphql-code-generator/commit/307a5d350643dd065d228b04ef3b4bd70cac0e81)]:
  - @graphql-codegen/plugin-helpers@3.1.1

## 2.6.7

### Patch Changes

- Updated dependencies [[`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`f79a00e8a`](https://github.com/dotansimha/graphql-code-generator/commit/f79a00e8ae073eab426ca08795c924e716123482), [`c802a0c0b`](https://github.com/dotansimha/graphql-code-generator/commit/c802a0c0b775cfabc5ace3e7fb6655540c6c4d84)]:
  - @graphql-codegen/plugin-helpers@3.0.0

## 2.6.6

### Patch Changes

- [#8606](https://github.com/dotansimha/graphql-code-generator/pull/8606) [`45eb2b18a`](https://github.com/dotansimha/graphql-code-generator/commit/45eb2b18adf25366248bf8d67ef696431db5ee0e) Thanks [@charlypoly](https://github.com/charlypoly)! - dependencies updates:

  - Updated dependency [`@graphql-tools/utils@^9.1.1` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/9.1.1) (from `9.0.0`, in `dependencies`)

- [#8606](https://github.com/dotansimha/graphql-code-generator/pull/8606) [`45eb2b18a`](https://github.com/dotansimha/graphql-code-generator/commit/45eb2b18adf25366248bf8d67ef696431db5ee0e) Thanks [@charlypoly](https://github.com/charlypoly)! - Fix validation issue on fragment/ops naming conflict

## 2.6.5

### Patch Changes

- [#8556](https://github.com/dotansimha/graphql-code-generator/pull/8556) [`64e553c3f`](https://github.com/dotansimha/graphql-code-generator/commit/64e553c3f62618a2aedf122d292e2700fd93d6e1) Thanks [@charlypoly](https://github.com/charlypoly)! - dependencies updates:
  - Updated dependency [`@graphql-tools/utils@9.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/9.0.0) (from `^8.8.0`, in `dependencies`)

## 2.6.4

### Patch Changes

- [#8548](https://github.com/dotansimha/graphql-code-generator/pull/8548) [`516170ef6`](https://github.com/dotansimha/graphql-code-generator/commit/516170ef6cb636c950d560ddf12fa1d2f7ee1c57) Thanks [@charlypoly](https://github.com/charlypoly)! - dependencies updates:

  - Updated dependency [`@graphql-tools/utils@9.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/9.0.0) (from `^8.8.0`, in `dependencies`)

- [#8548](https://github.com/dotansimha/graphql-code-generator/pull/8548) [`516170ef6`](https://github.com/dotansimha/graphql-code-generator/commit/516170ef6cb636c950d560ddf12fa1d2f7ee1c57) Thanks [@charlypoly](https://github.com/charlypoly)! - Improve codegen documents and schema validation

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
