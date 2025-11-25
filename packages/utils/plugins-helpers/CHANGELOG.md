# @graphql-codegen/plugin-helpers

## 6.1.0

### Minor Changes

- [#10510](https://github.com/dotansimha/graphql-code-generator/pull/10510) [`9e70bcb`](https://github.com/dotansimha/graphql-code-generator/commit/9e70bcbf5390e815a6844f1965b04056e5d8e670) Thanks [@nickmessing](https://github.com/nickmessing)! - add importExtension configuration option

## 6.0.0

### Major Changes

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - BREAKING CHANGES: Do not generate \_\_isTypeOf for non-implementing types or non-union members

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - Remove deprecated option `watchConfig`

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - Ensure Federation Interfaces have `__resolveReference` if they are resolvable entities

  BREAKING CHANGES: Deprecate `onlyResolveTypeForInterfaces` because majority of use cases cannot implement resolvers in Interfaces.
  BREAKING CHANGES: Deprecate `generateInternalResolversIfNeeded.__resolveReference` because types do not have `__resolveReference` if they are not Federation entities or are not resolvable. Users should not have to manually set this option. This option was put in to wait for this major version.

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - BREAKING CHANGE: Improve Federation Entity's resolvers' parent param type: These types were using reference types inline. This makes it hard to handle mappers. The Parent type now all comes from ParentResolverTypes to make handling mappers and parent types simpler.

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - Fix `mappers` usage with Federation

  `mappers` was previously used as `__resolveReference`'s first param (usually called "reference"). However, this is incorrect because `reference` interface comes directly from `@key` and `@requires` directives. This patch fixes the issue by creating a new `FederationTypes` type and use it as the base for federation entity types when being used to type entity references.

  BREAKING CHANGES: No longer generate `UnwrappedObject` utility type, as this was used to support the wrong previously generated type.

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - Drop Node 18 support

### Minor Changes

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - Add `allowPartialOutputs` flag to partially write successful generation to files

### Patch Changes

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - Update @requires type

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - Fix fields or object types marked with @external being wrongly generated

## 5.1.1

### Patch Changes

- [#10150](https://github.com/dotansimha/graphql-code-generator/pull/10150) [`e324382`](https://github.com/dotansimha/graphql-code-generator/commit/e3243824cfe0d7ab463cf0d5a6455715510959be) Thanks [@ArminWiebigke](https://github.com/ArminWiebigke)! - Allow functions to be passed as valid values for `UrlSchemaOptions.customFetch`. This was already possible, but the type definitions did not reflect that correctly.

## 5.1.0

### Minor Changes

- [#9989](https://github.com/dotansimha/graphql-code-generator/pull/9989) [`55a1e9e`](https://github.com/dotansimha/graphql-code-generator/commit/55a1e9e63830df17ed40602ea7e322bbf48b17bc) Thanks [@eddeee888](https://github.com/eddeee888)! - Add `generateInternalResolversIfNeeded` option

  This option can be used to generate more correct types for internal resolvers. For example, only generate `__resolveReference` if the federation object has a resolvable `@key`.

  In the future, this option can be extended to support other internal resolvers e.g. `__isTypeOf` is only generated for implementing types and union members.

## 5.0.4

### Patch Changes

- [#9961](https://github.com/dotansimha/graphql-code-generator/pull/9961) [`dfc5310`](https://github.com/dotansimha/graphql-code-generator/commit/dfc5310ab476bed6deaefc608f311ff368722f7e) Thanks [@eddeee888](https://github.com/eddeee888)! - Update plugin output type to allow option `meta` field

## 5.0.3

### Patch Changes

- [#9813](https://github.com/dotansimha/graphql-code-generator/pull/9813) [`4e69568`](https://github.com/dotansimha/graphql-code-generator/commit/4e6956899c96f8954cea8d5bbe32aa35a70cc653) Thanks [@saihaj](https://github.com/saihaj)! - bumping for a release

## 5.0.2

### Patch Changes

- [#9811](https://github.com/dotansimha/graphql-code-generator/pull/9811) [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975) Thanks [@saihaj](https://github.com/saihaj)! - dependencies updates:
  - Updated dependency [`tslib@~2.6.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.6.0) (from `~2.5.0`, in `dependencies`)

## 5.0.1

### Patch Changes

- [#9523](https://github.com/dotansimha/graphql-code-generator/pull/9523) [`bb1e0e96e`](https://github.com/dotansimha/graphql-code-generator/commit/bb1e0e96ed9d519684630cd7ea53869b48b4632e) Thanks [@tnyo43](https://github.com/tnyo43)! - add noSilentErrors option to the config type

## 5.0.0

### Major Changes

- [`bb66c2a31`](https://github.com/dotansimha/graphql-code-generator/commit/bb66c2a31985c1375912ccd6b2b02933f313c9c0) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Require Node.js `>= 16`. Drop support for Node.js 14

### Patch Changes

- [#9449](https://github.com/dotansimha/graphql-code-generator/pull/9449) [`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2) Thanks [@n1ru4l](https://github.com/n1ru4l)! - dependencies updates:

  - Updated dependency [`@graphql-tools/utils@^10.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/10.0.0) (from `^9.0.0`, in `dependencies`)

- [#9332](https://github.com/dotansimha/graphql-code-generator/pull/9332) [`f46803a8c`](https://github.com/dotansimha/graphql-code-generator/commit/f46803a8c70840280529a52acbb111c865712af2) Thanks [@eddeee888](https://github.com/eddeee888)! - Update GitHub loader TypeScript type and usage docs

- [#9360](https://github.com/dotansimha/graphql-code-generator/pull/9360) [`63827fabe`](https://github.com/dotansimha/graphql-code-generator/commit/63827fabede76b2380d40392aba2a3ccb099f0c4) Thanks [@beerose](https://github.com/beerose)! - Add handleAsSDL property to UrlSchemaOptions type

## 4.2.0

### Minor Changes

- [#9151](https://github.com/dotansimha/graphql-code-generator/pull/9151) [`b7dacb21f`](https://github.com/dotansimha/graphql-code-generator/commit/b7dacb21fb0ed1173d1e45120dc072e29231ed29) Thanks [@'./user/schema.mappers#UserMapper',](https://github.com/'./user/schema.mappers#UserMapper',)! - Add `watchPattern` config option for `generates` sections.

  By default, `watch` mode automatically watches all GraphQL schema and document files. This means when a change is detected, Codegen CLI is run.

  A user may want to run Codegen CLI when non-schema and non-document files are changed. Each `generates` section now has a `watchPattern` option to allow more file patterns to be added to the list of patterns to watch.

  In the example below, mappers are exported from `schema.mappers.ts` files. We want to re-run Codegen if the content of `*.mappers.ts` files change because they change the generated types file. To solve this, we can add mapper file patterns to watch using the glob pattern used for schema and document files.

  ```ts
  // codegen.ts
  const config: CodegenConfig = {
    schema: 'src/schema/**/*.graphql',
    generates: {
      'src/schema/types.ts': {
        plugins: ['typescript', 'typescript-resolvers'],
        config: {
          mappers: {

            Book: './book/schema.mappers#BookMapper',
          },
        }
        watchPattern: 'src/schema/**/*.mappers.ts', // Watches mapper files in `watch` mode. Use an array for multiple patterns e.g. `['src/*.pattern1.ts','src/*.pattern2.ts']`
      },
    },
  };
  ```

  Then, run Codegen CLI in `watch` mode:

  ```shell
  yarn graphql-codegen --watch
  ```

  Now, updating `*.mappers.ts` files re-runs Codegen! 🎉

  Note: `watchPattern` is only used in `watch` mode i.e. running CLI with `--watch` flag.

### Patch Changes

- [`f104619ac`](https://github.com/dotansimha/graphql-code-generator/commit/f104619acd27c9d62a06bc577737500880731087) Thanks [@saihaj](https://github.com/saihaj)! - Resolve issue with nesting fields in `@provides` directive being prevented

## 4.1.0

### Minor Changes

- [#8893](https://github.com/dotansimha/graphql-code-generator/pull/8893) [`a118c307a`](https://github.com/dotansimha/graphql-code-generator/commit/a118c307a35bbb97b7cbca0f178a88276032a26c) Thanks [@n1ru4l](https://github.com/n1ru4l)! - mark `plugins` in config optional

- [#8723](https://github.com/dotansimha/graphql-code-generator/pull/8723) [`a3309e63e`](https://github.com/dotansimha/graphql-code-generator/commit/a3309e63efed880e6f74ce6fcbf82dd3d7857a15) Thanks [@kazekyo](https://github.com/kazekyo)! - Introduce a new feature called DocumentTransform.

  DocumentTransform is a functionality that allows you to modify `documents` before they are processed by plugins. You can use functions passed to the `documentTransforms` option to make changes to GraphQL documents.

  To use this feature, you can write `documentTransforms` as follows:

  ```ts
  import type { CodegenConfig } from '@graphql-codegen/cli'

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
              return documents
            }
          }
        ]
      }
    }
  }
  export default config
  ```

  For instance, to remove a `@localOnlyDirective` directive from `documents`, you can write the following code:

  ```js
  import type { CodegenConfig } from '@graphql-codegen/cli'
  import { visit } from 'graphql'

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
                      if (node.name.value === 'localOnlyDirective') return null
                    }
                  }
                })
                return documentFile
              })
            }
          }
        ]
      }
    }
  }
  export default config
  ```

  DocumentTransform can also be specified by file name. You can create a custom file for a specific transformation and pass it to `documentTransforms`.

  Let's create the document transform as a file:

  ```js
  module.exports = {
    transform: ({ documents }) => {
      // Make some changes to the documents
      return documents
    }
  }
  ```

  Then, you can specify the file name as follows:

  ```ts
  import type { CodegenConfig } from '@graphql-codegen/cli'

  const config: CodegenConfig = {
    schema: 'https://localhost:4000/graphql',
    documents: ['src/**/*.tsx'],
    generates: {
      './src/gql/': {
        preset: 'client',
        documentTransforms: ['./my-document-transform.js']
      }
    }
  }
  export default config
  ```

### Patch Changes

- [#8879](https://github.com/dotansimha/graphql-code-generator/pull/8879) [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`tslib@~2.5.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.5.0) (from `~2.4.0`, in `dependencies`)

## 4.0.0

### Major Changes

- [#8885](https://github.com/dotansimha/graphql-code-generator/pull/8885) [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d) Thanks [@n1ru4l](https://github.com/n1ru4l)! - drop Node.js 12 support

### Patch Changes

- [#8871](https://github.com/dotansimha/graphql-code-generator/pull/8871) [`fc79b65d4`](https://github.com/dotansimha/graphql-code-generator/commit/fc79b65d4914fd25ae6bd5d58ebc7ded573a08a5) Thanks [@B2o5T](https://github.com/B2o5T)! - eslint fixes

## 3.1.2

### Patch Changes

- [#8771](https://github.com/dotansimha/graphql-code-generator/pull/8771) [`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency [`@graphql-tools/utils@^9.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/9.0.0) (from `^8.8.0`, in `dependencies`)

- [#8718](https://github.com/dotansimha/graphql-code-generator/pull/8718) [`6c6b6f2df`](https://github.com/dotansimha/graphql-code-generator/commit/6c6b6f2df88a3a37b437a25320dab5590f033316) Thanks [@AaronBuxbaum](https://github.com/AaronBuxbaum)! - Add `globalGqlIdentifierName` to the types

## 3.1.1

### Patch Changes

- [`307a5d350`](https://github.com/dotansimha/graphql-code-generator/commit/307a5d350643dd065d228b04ef3b4bd70cac0e81) Thanks [@saihaj](https://github.com/saihaj)! - Something went wrong in old relesae so this will ensure we have a good bump on all packages

## 3.1.0

### Minor Changes

- [#8662](https://github.com/dotansimha/graphql-code-generator/pull/8662) [`c0183810f`](https://github.com/dotansimha/graphql-code-generator/commit/c0183810f0178aec6f49ab8a6f35f7adc4d9f13e) Thanks [@jantimon](https://github.com/jantimon)! - the life cycle hook beforeOneFileWrite is now able to modify the generated content

## 3.0.0

### Major Changes

- [#8652](https://github.com/dotansimha/graphql-code-generator/pull/8652) [`c802a0c0b`](https://github.com/dotansimha/graphql-code-generator/commit/c802a0c0b775cfabc5ace3e7fb6655540c6c4d84) Thanks [@jantimon](https://github.com/jantimon)! - improve typings for life cycle hooks

### Patch Changes

- [#8686](https://github.com/dotansimha/graphql-code-generator/pull/8686) [`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency [`change-case-all@1.0.15` ↗︎](https://www.npmjs.com/package/change-case-all/v/1.0.15) (from `1.0.14`, in `dependencies`)

- [#8661](https://github.com/dotansimha/graphql-code-generator/pull/8661) [`f79a00e8a`](https://github.com/dotansimha/graphql-code-generator/commit/f79a00e8ae073eab426ca08795c924e716123482) Thanks [@jantimon](https://github.com/jantimon)! - refactor hook execution

## 2.7.2

### Patch Changes

- [#8525](https://github.com/dotansimha/graphql-code-generator/pull/8525) [`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127) Thanks [@charlypoly](https://github.com/charlypoly)! - remove `DetailledError`, not supported by Listr renderer

## 2.7.1

### Patch Changes

- [#8368](https://github.com/dotansimha/graphql-code-generator/pull/8368) [`4113b1bd3`](https://github.com/dotansimha/graphql-code-generator/commit/4113b1bd39f3d32759c68a292e8492a0dd4f7371) Thanks [@charlypoly](https://github.com/charlypoly)! - fix(cli): support ApolloEngine loader in TypeScript config

## 2.7.0

### Minor Changes

- [#8301](https://github.com/dotansimha/graphql-code-generator/pull/8301) [`2ed21a471`](https://github.com/dotansimha/graphql-code-generator/commit/2ed21a471f8de58ecafebf4bf64b3c32cee24d2f) Thanks [@charlypoly](https://github.com/charlypoly)! - Introduces support for TypeScript config file and a new preset lifecycle (required for `client-preset`)

## 2.6.2

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189) [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with `moduleResolution` `node16` or `nodenext`

## 2.6.1

### Patch Changes

- 6a2e328e6: feat(cli): `--verbose` and `--debug` flags

## 2.6.0

### Minor Changes

- 2cbcbb371: Add new flag to emit legacy common js imports. Default it will be `true` this way it ensure that generated code works with [non-compliant bundlers](https://github.com/dotansimha/graphql-code-generator/issues/8065).

  You can use the option in your config:

  ```yaml
  schema: 'schema.graphql'
   documents:
     - 'src/**/*.graphql'
   emitLegacyCommonJSImports: true
  ```

  Alternative you can use the CLI to set this option:

  ```bash
  $ codegen --config-file=config.yml --emit-legacy-common-js-imports
  ```

## 2.5.0

### Minor Changes

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

- a4fe5006b: Fix TS type error on strictNullChecks: true

  Fix the compiler error:

  ```
  node_modules/@graphql-codegen/plugin-helpers/oldVisit.d.ts:5:75 - error TS2339: Property 'enter' does not exist on type '{ readonly enter?: ASTVisitFn<NameNode> | undefined; readonly leave: ASTReducerFn<NameNode, unknown>; } | { readonly enter?: ASTVisitFn<DocumentNode> | undefined; readonly leave: ASTReducerFn<...>; } | ... 41 more ... | undefined'.

  5     enter?: Partial<Record<keyof NewVisitor, NewVisitor[keyof NewVisitor]['enter']>>;
                                                                              ~~~~~~~

  node_modules/@graphql-codegen/plugin-helpers/oldVisit.d.ts:6:75 - error TS2339: Property 'leave' does not exist on type '{ readonly enter?: ASTVisitFn<NameNode> | undefined; readonly leave: ASTReducerFn<NameNode, unknown>; } | { readonly enter?: ASTVisitFn<DocumentNode> | undefined; readonly leave: ASTReducerFn<...>; } | ... 41 more ... | undefined'.

  6     leave?: Partial<Record<keyof NewVisitor, NewVisitor[keyof NewVisitor]['leave']>>;
                                                                              ~~~~~~~


  Found 2 errors in the same file, starting at: node_modules/@graphql-codegen/plugin-helpers/oldVisit.d.ts:5
  ```

  Only happens when TS compiler options `strictNullChecks: true` and `skipLibCheck: false`.

  `Partial<T>` includes `{}`, therefore `NewVisitor[keyof NewVisitor]` includes `undefined`, and indexing `undefined` is error.
  Eliminate `undefined` by wrapping it inside `NonNullable<...>`.

  Related #7519

## 2.4.2

### Patch Changes

- a521216d6: broken links within documentation

## 2.4.1

### Patch Changes

- cb9adeb96: Cache validation of documents

## 2.4.0

### Minor Changes

- 754a33715: Performance Profiler --profile

## 2.3.2

### Patch Changes

- 6002feb3d: Fix exports in package.json files for react-native projects

## 2.3.1

### Patch Changes

- bcc5636fc: fix wrong dependency version range

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
