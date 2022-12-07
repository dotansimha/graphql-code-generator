# @graphql-codegen/plugin-helpers

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
