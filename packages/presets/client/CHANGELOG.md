# @graphql-codegen/client-preset

## 1.2.0

### Minor Changes

- [#8657](https://github.com/dotansimha/graphql-code-generator/pull/8657) [`4b96035a8`](https://github.com/dotansimha/graphql-code-generator/commit/4b96035a8e0abca6715db586e8915ae968c403c6) Thanks [@charlypoly](https://github.com/charlypoly)! - Export a testing helper: `makeFragmentData(data, fragment)`

## 1.1.5

### Patch Changes

- Updated dependencies [[`00ddc9368`](https://github.com/dotansimha/graphql-code-generator/commit/00ddc9368211a4511b9f80d543d57c85fff840cb)]:
  - @graphql-codegen/gql-tag-operations@1.5.8

## 1.1.4

### Patch Changes

- Updated dependencies [[`ef4c2c9c2`](https://github.com/dotansimha/graphql-code-generator/commit/ef4c2c9c233c68830f10eb4c167c7cceead27122)]:
  - @graphql-codegen/visitor-plugin-common@2.13.2
  - @graphql-codegen/typescript@2.8.2
  - @graphql-codegen/gql-tag-operations@1.5.7
  - @graphql-codegen/typescript-operations@2.5.7
  - @graphql-codegen/typed-document-node@2.3.7

## 1.1.3

### Patch Changes

- Updated dependencies [[`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127)]:
  - @graphql-codegen/visitor-plugin-common@2.13.1
  - @graphql-codegen/plugin-helpers@2.7.2
  - @graphql-codegen/gql-tag-operations@1.5.6
  - @graphql-codegen/typescript-operations@2.5.6
  - @graphql-codegen/typed-document-node@2.3.6
  - @graphql-codegen/typescript@2.8.1

## 1.1.2

### Patch Changes

- [#8545](https://github.com/dotansimha/graphql-code-generator/pull/8545) [`3e7792486`](https://github.com/dotansimha/graphql-code-generator/commit/3e7792486e088a0dc10a0e3e4f5e0dff2ca031de) Thanks [@tojump](https://github.com/tojump)! - Forward dedupeFragments config option

## 1.1.1

### Patch Changes

- [#8523](https://github.com/dotansimha/graphql-code-generator/pull/8523) [`3a3202fbb`](https://github.com/dotansimha/graphql-code-generator/commit/3a3202fbb671617d34075040e7aa8129650bbcb1) Thanks [@charlypoly](https://github.com/charlypoly)! - allow non-typescript plugins

## 1.1.0

### Minor Changes

- [#8498](https://github.com/dotansimha/graphql-code-generator/pull/8498) [`a46b8d99c`](https://github.com/dotansimha/graphql-code-generator/commit/a46b8d99c797283d773ec14163c62be9c84d4c2b) Thanks [@charlypoly](https://github.com/charlypoly)! - Fragment masking ` $fragmentName` and ` $fragmentRefs` are optionals

### Patch Changes

- [#8500](https://github.com/dotansimha/graphql-code-generator/pull/8500) [`71aae7a92`](https://github.com/dotansimha/graphql-code-generator/commit/71aae7a92f77ec5ce29631b292d84e066219ea35) Thanks [@charlypoly](https://github.com/charlypoly)! - Add warning and errors to prevent unwanted configuration

- Updated dependencies [[`a46b8d99c`](https://github.com/dotansimha/graphql-code-generator/commit/a46b8d99c797283d773ec14163c62be9c84d4c2b)]:
  - @graphql-codegen/visitor-plugin-common@2.13.0
  - @graphql-codegen/gql-tag-operations@1.5.5
  - @graphql-codegen/typescript-operations@2.5.5
  - @graphql-codegen/typed-document-node@2.3.5
  - @graphql-codegen/typescript@2.7.5

## 1.0.7

### Patch Changes

- [#8472](https://github.com/dotansimha/graphql-code-generator/pull/8472) [`a08fb6502`](https://github.com/dotansimha/graphql-code-generator/commit/a08fb6502f5dec6babcb78dbecd621f05a3e300c) Thanks [@panusoi](https://github.com/panusoi)! - The client preset now allows the use of the `enumsAsTypes` config option

## 1.0.6

### Patch Changes

- Updated dependencies [[`1bd7f771c`](https://github.com/dotansimha/graphql-code-generator/commit/1bd7f771ccb949a5a37395c7c57cb41c19340714)]:
  - @graphql-codegen/visitor-plugin-common@2.12.2
  - @graphql-codegen/gql-tag-operations@1.5.4
  - @graphql-codegen/typescript-operations@2.5.4
  - @graphql-codegen/typed-document-node@2.3.4
  - @graphql-codegen/typescript@2.7.4

## 1.0.5

### Patch Changes

- [#8457](https://github.com/dotansimha/graphql-code-generator/pull/8457) [`126194017`](https://github.com/dotansimha/graphql-code-generator/commit/1261940173b8266d17fa03c1775104aff6086d3c) Thanks [@charlypoly](https://github.com/charlypoly)! - typo in config mapping

## 1.0.4

### Patch Changes

- [#8455](https://github.com/dotansimha/graphql-code-generator/pull/8455) [`d19573d88`](https://github.com/dotansimha/graphql-code-generator/commit/d19573d889513abab77a99d5f75f25612a891446) Thanks [@charlypoly](https://github.com/charlypoly)! - The client preset now allows the use of the following `config`:
  - `scalars`
  - `defaultScalarType`
  - `strictScalars`
  - `namingConvention`
  - `useTypeImports`
  - `skipTypename`
  - `arrayInputCoercion`

## 1.0.3

### Patch Changes

- [#8443](https://github.com/dotansimha/graphql-code-generator/pull/8443) [`e2d115146`](https://github.com/dotansimha/graphql-code-generator/commit/e2d11514695ca56674983e8b3b7549cd3b440a5d) Thanks [@charlypoly](https://github.com/charlypoly)! - fix(gql-tag-operations): issues with "no documents" scenario

- Updated dependencies [[`e2d115146`](https://github.com/dotansimha/graphql-code-generator/commit/e2d11514695ca56674983e8b3b7549cd3b440a5d)]:
  - @graphql-codegen/gql-tag-operations@1.5.3

## 1.0.2

### Patch Changes

- [#8402](https://github.com/dotansimha/graphql-code-generator/pull/8402) [`a76c606e3`](https://github.com/dotansimha/graphql-code-generator/commit/a76c606e3b631ef903d4066e2643bc7f95457e30) Thanks [@charlypoly](https://github.com/charlypoly)! - dependencies updates:

  - Updated dependency [`@graphql-codegen/gql-tag-operations@1.5.1` ↗︎](https://www.npmjs.com/package/@graphql-codegen/gql-tag-operations/v/1.5.1) (from `^1.5.0`, in `dependencies`)

- [#8402](https://github.com/dotansimha/graphql-code-generator/pull/8402) [`a76c606e3`](https://github.com/dotansimha/graphql-code-generator/commit/a76c606e3b631ef903d4066e2643bc7f95457e30) Thanks [@charlypoly](https://github.com/charlypoly)! - update `@graphql-codegen/gql-tag-operations`

- Updated dependencies [[`a76c606e3`](https://github.com/dotansimha/graphql-code-generator/commit/a76c606e3b631ef903d4066e2643bc7f95457e30)]:
  - @graphql-codegen/gql-tag-operations@1.5.2

## 1.0.1

### Patch Changes

- [#8302](https://github.com/dotansimha/graphql-code-generator/pull/8302) [`876844e76`](https://github.com/dotansimha/graphql-code-generator/commit/876844e7644a917172f09b3c4eb54a2f4c90e4c6) Thanks [@charlypoly](https://github.com/charlypoly)! - **`@graphql-codegen/gql-tag-operations` and `@graphql-codegen/gql-tag-operations-preset`**

  Introduce a `gqlTagName` configuration option

  ***

  **`@graphql-codegen/client-preset`**

  New preset for GraphQL Code Generator v3, more information on the RFC: https://github.com/dotansimha/graphql-code-generator/issues/8296

  ***

  **`@graphql-codegen/cli`**

  Update init wizard with 3.0 recommendations (`codegen.ts`, `client` preset)

- Updated dependencies [[`876844e76`](https://github.com/dotansimha/graphql-code-generator/commit/876844e7644a917172f09b3c4eb54a2f4c90e4c6)]:
  - @graphql-codegen/gql-tag-operations@1.5.0
