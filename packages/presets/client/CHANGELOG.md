# @graphql-codegen/client-preset

## 5.2.2

### Patch Changes

- Updated dependencies [[`f588d91`](https://github.com/dotansimha/graphql-code-generator/commit/f588d91ac43ea0aa5931915ce980d2e6876bb59c)]:
  - @graphql-codegen/visitor-plugin-common@6.2.2
  - @graphql-codegen/gql-tag-operations@5.1.2
  - @graphql-codegen/typescript-operations@5.0.7
  - @graphql-codegen/typed-document-node@6.1.5
  - @graphql-codegen/typescript@5.0.7

## 5.2.1

### Patch Changes

- Updated dependencies [[`b995ed1`](https://github.com/dotansimha/graphql-code-generator/commit/b995ed13a49379ea05e0e313fac68b557527523a)]:
  - @graphql-codegen/visitor-plugin-common@6.2.1
  - @graphql-codegen/gql-tag-operations@5.1.1
  - @graphql-codegen/typescript-operations@5.0.6
  - @graphql-codegen/typed-document-node@6.1.4
  - @graphql-codegen/typescript@5.0.6

## 5.2.0

### Minor Changes

- [#10510](https://github.com/dotansimha/graphql-code-generator/pull/10510) [`9e70bcb`](https://github.com/dotansimha/graphql-code-generator/commit/9e70bcbf5390e815a6844f1965b04056e5d8e670) Thanks [@nickmessing](https://github.com/nickmessing)! - add importExtension configuration option

### Patch Changes

- Updated dependencies [[`f821e8a`](https://github.com/dotansimha/graphql-code-generator/commit/f821e8ab9351f23a9f7e5d5e6fc69c8e8868cad8), [`9e70bcb`](https://github.com/dotansimha/graphql-code-generator/commit/9e70bcbf5390e815a6844f1965b04056e5d8e670)]:
  - @graphql-codegen/visitor-plugin-common@6.2.0
  - @graphql-codegen/gql-tag-operations@5.1.0
  - @graphql-codegen/plugin-helpers@6.1.0
  - @graphql-codegen/typescript-operations@5.0.5
  - @graphql-codegen/typed-document-node@6.1.3
  - @graphql-codegen/typescript@5.0.5

## 5.1.3

### Patch Changes

- [#10499](https://github.com/dotansimha/graphql-code-generator/pull/10499) [`51a1a72`](https://github.com/dotansimha/graphql-code-generator/commit/51a1a7280578d43681391df11d320a8416c0b41d) Thanks [@eddeee888](https://github.com/eddeee888)! - Fix nested fragment not getting correct meta field in Client Preset

- Updated dependencies [[`51a1a72`](https://github.com/dotansimha/graphql-code-generator/commit/51a1a7280578d43681391df11d320a8416c0b41d)]:
  - @graphql-codegen/visitor-plugin-common@6.1.2
  - @graphql-codegen/gql-tag-operations@5.0.5
  - @graphql-codegen/typescript-operations@5.0.4
  - @graphql-codegen/typed-document-node@6.1.2
  - @graphql-codegen/typescript@5.0.4

## 5.1.2

### Patch Changes

- Updated dependencies [[`6715330`](https://github.com/dotansimha/graphql-code-generator/commit/67153304646694d75aee24afd70c3fce12e9f1f2)]:
  - @graphql-codegen/visitor-plugin-common@6.1.1
  - @graphql-codegen/gql-tag-operations@5.0.4
  - @graphql-codegen/typescript-operations@5.0.3
  - @graphql-codegen/typed-document-node@6.1.1
  - @graphql-codegen/typescript@5.0.3

## 5.1.1

### Patch Changes

- Updated dependencies [[`1debf51`](https://github.com/dotansimha/graphql-code-generator/commit/1debf51aa714e2a53256419c549f6770b6c894a6)]:
  - @graphql-codegen/gql-tag-operations@5.0.3

## 5.1.0

### Minor Changes

- [#10459](https://github.com/dotansimha/graphql-code-generator/pull/10459) [`87184aa`](https://github.com/dotansimha/graphql-code-generator/commit/87184aa240cb6209e7b3ade13aa54da6ff0b3dff) Thanks [@eddeee888](https://github.com/eddeee888)! - Forward immutableTypes to client preset config

## 5.0.3

### Patch Changes

- Updated dependencies [[`8258f1f`](https://github.com/dotansimha/graphql-code-generator/commit/8258f1f6012c106d02ef28bca9ec424f70c4aa26)]:
  - @graphql-codegen/visitor-plugin-common@6.1.0
  - @graphql-codegen/gql-tag-operations@5.0.2
  - @graphql-codegen/typescript-operations@5.0.2
  - @graphql-codegen/typed-document-node@6.0.2
  - @graphql-codegen/typescript@5.0.2

## 5.0.2

### Patch Changes

- Updated dependencies [[`accdab6`](https://github.com/dotansimha/graphql-code-generator/commit/accdab69106605241933e9d66d64dc7077656f30)]:
  - @graphql-codegen/visitor-plugin-common@6.0.1
  - @graphql-codegen/gql-tag-operations@5.0.1
  - @graphql-codegen/typescript-operations@5.0.1
  - @graphql-codegen/typed-document-node@6.0.1
  - @graphql-codegen/typescript@5.0.1

## 5.0.1

### Patch Changes

- [#10393](https://github.com/dotansimha/graphql-code-generator/pull/10393) [`ee2276c`](https://github.com/dotansimha/graphql-code-generator/commit/ee2276cb073a87458eda957a17c9e296c1cf313a) Thanks [@eddeee888](https://github.com/eddeee888)! - Include undefined explicitly for input maybe value in Client Preset

## 5.0.0

### Major Changes

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - BREAKING CHANGE: Use Record<PropertyKey, never> instead of {} for empty object type

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - Stop passing through the deprecated config option `dedupeFragments`

- [#10218](https://github.com/dotansimha/graphql-code-generator/pull/10218) [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2) Thanks [@eddeee888](https://github.com/eddeee888)! - Drop Node 18 support

### Patch Changes

- Updated dependencies [[`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2), [`140298a`](https://github.com/dotansimha/graphql-code-generator/commit/140298a33b257a0b7958e361971b5bc97bbc01c2)]:
  - @graphql-codegen/visitor-plugin-common@6.0.0
  - @graphql-codegen/plugin-helpers@6.0.0
  - @graphql-codegen/typescript@5.0.0
  - @graphql-codegen/typescript-operations@5.0.0
  - @graphql-codegen/add@6.0.0
  - @graphql-codegen/gql-tag-operations@5.0.0
  - @graphql-codegen/typed-document-node@6.0.0

## 4.8.3

### Patch Changes

- [#10362](https://github.com/dotansimha/graphql-code-generator/pull/10362) [`3188b8c`](https://github.com/dotansimha/graphql-code-generator/commit/3188b8c39e9fd24e3dbbd0bcc8767052153eb399) Thanks [@Brookke](https://github.com/Brookke)! - Make generated type compatible with noImplicitOverride=true

- [#10373](https://github.com/dotansimha/graphql-code-generator/pull/10373) [`c3295f9`](https://github.com/dotansimha/graphql-code-generator/commit/c3295f9c60383e5631ccc4080bc28e7c00a4d61b) Thanks [@eddeee888](https://github.com/eddeee888)! - Fix client preset not working with exactOptionalPropertyTypes=true when documentMode=string

- Updated dependencies [[`3188b8c`](https://github.com/dotansimha/graphql-code-generator/commit/3188b8c39e9fd24e3dbbd0bcc8767052153eb399), [`c3295f9`](https://github.com/dotansimha/graphql-code-generator/commit/c3295f9c60383e5631ccc4080bc28e7c00a4d61b)]:
  - @graphql-codegen/typed-document-node@5.1.2

## 4.8.2

### Patch Changes

- [#10120](https://github.com/dotansimha/graphql-code-generator/pull/10120) [`98392fc`](https://github.com/dotansimha/graphql-code-generator/commit/98392fc5d91035b5b5b0ffdefd78d0398762a523) Thanks [@yangirov](https://github.com/yangirov)! - The `@graphql-codegen/client-preset` package now supports the `enumValues` option.

- Updated dependencies [[`e324382`](https://github.com/dotansimha/graphql-code-generator/commit/e3243824cfe0d7ab463cf0d5a6455715510959be)]:
  - @graphql-codegen/plugin-helpers@5.1.1

## 4.8.1

### Patch Changes

- [#10330](https://github.com/dotansimha/graphql-code-generator/pull/10330) [`c5efba3`](https://github.com/dotansimha/graphql-code-generator/commit/c5efba34a7b422720be9ce32937dd19fb0784bae) Thanks [@jnoordsij](https://github.com/jnoordsij)! - Make graphql-sock optional peerDep

- Updated dependencies [[`c5efba3`](https://github.com/dotansimha/graphql-code-generator/commit/c5efba34a7b422720be9ce32937dd19fb0784bae)]:
  - @graphql-codegen/typescript-operations@4.6.1

## 4.8.0

### Minor Changes

- [#10323](https://github.com/dotansimha/graphql-code-generator/pull/10323) [`f3cf4df`](https://github.com/dotansimha/graphql-code-generator/commit/f3cf4df358a896c5df0a7d8909c2fbf192e10c01) Thanks [@eddeee888](https://github.com/eddeee888)! - Add support for `nullability.errorHandlingClient`. This allows clients to get stronger types with [semantic nullability](https://github.com/graphql/graphql-wg/blob/main/rfcs/SemanticNullability.md)-enabled schemas.

### Patch Changes

- Updated dependencies [[`f6909d1`](https://github.com/dotansimha/graphql-code-generator/commit/f6909d1797c15b79a0afb7ec089471763a485bfc), [`f3cf4df`](https://github.com/dotansimha/graphql-code-generator/commit/f3cf4df358a896c5df0a7d8909c2fbf192e10c01)]:
  - @graphql-codegen/visitor-plugin-common@5.8.0
  - @graphql-codegen/typescript-operations@4.6.0
  - @graphql-codegen/gql-tag-operations@4.0.17
  - @graphql-codegen/typed-document-node@5.1.1
  - @graphql-codegen/typescript@4.1.6

## 4.7.0

### Minor Changes

- [#10307](https://github.com/dotansimha/graphql-code-generator/pull/10307) [`bfe3c75`](https://github.com/dotansimha/graphql-code-generator/commit/bfe3c7575e0b5f3a252fe9d72416f7829e44c885) Thanks [@mvantellingen](https://github.com/mvantellingen)! - Update generated code to be compatible with TypeScript 5.8 `erasableSyntaxOnly` flag

### Patch Changes

- Updated dependencies [[`bfe3c75`](https://github.com/dotansimha/graphql-code-generator/commit/bfe3c7575e0b5f3a252fe9d72416f7829e44c885)]:
  - @graphql-codegen/typed-document-node@5.1.0

## 4.6.4

### Patch Changes

- [#10302](https://github.com/dotansimha/graphql-code-generator/pull/10302) [`d8566c0`](https://github.com/dotansimha/graphql-code-generator/commit/d8566c015943ea4dbcaeaf57d3d8406553ae230a) Thanks [@eddeee888](https://github.com/eddeee888)! - Fix Apollo unmask directive incorrectly generating fragmentRefs

- Updated dependencies [[`d8566c0`](https://github.com/dotansimha/graphql-code-generator/commit/d8566c015943ea4dbcaeaf57d3d8406553ae230a)]:
  - @graphql-codegen/visitor-plugin-common@5.7.1
  - @graphql-codegen/typescript-operations@4.5.1
  - @graphql-codegen/gql-tag-operations@4.0.16
  - @graphql-codegen/typed-document-node@5.0.15
  - @graphql-codegen/typescript@4.1.5

## 4.6.3

### Patch Changes

- [#10298](https://github.com/dotansimha/graphql-code-generator/pull/10298) [`3efc472`](https://github.com/dotansimha/graphql-code-generator/commit/3efc472b970754b05b1e1f9fe7d33cfa5ec65455) Thanks [@dotansimha](https://github.com/dotansimha)! - Fix a bug where fragment spreads with `@client` directives is not being removed from the generated persisted documents

- Updated dependencies [[`6d7c1d7`](https://github.com/dotansimha/graphql-code-generator/commit/6d7c1d7c0a4662acdc0efafd4234229ad0a8dd3c)]:
  - @graphql-codegen/visitor-plugin-common@5.7.0
  - @graphql-codegen/typescript-operations@4.5.0
  - @graphql-codegen/gql-tag-operations@4.0.15
  - @graphql-codegen/typed-document-node@5.0.14
  - @graphql-codegen/typescript@4.1.4

## 4.6.2

### Patch Changes

- [#10280](https://github.com/dotansimha/graphql-code-generator/pull/10280) [`6da52a3`](https://github.com/dotansimha/graphql-code-generator/commit/6da52a3248c0ac9ef32140d130ac3da6fcaa1445) Thanks [@konomae](https://github.com/konomae)! - fix `onlyEnums` passthrough in client-preset

## 4.6.1

### Patch Changes

- Updated dependencies [[`ec07018`](https://github.com/dotansimha/graphql-code-generator/commit/ec070189a1a3c4d41f2457b56a68b506c81f28ba)]:
  - @graphql-codegen/gql-tag-operations@4.0.14

## 4.6.0

### Minor Changes

- [#10268](https://github.com/dotansimha/graphql-code-generator/pull/10268) [`8737dd8`](https://github.com/dotansimha/graphql-code-generator/commit/8737dd86b4ce3d14234a515fa494736bf7ec35dd) Thanks [@eddeee888](https://github.com/eddeee888)! - Forward customDirectives to support Apollo unmask

- [#10155](https://github.com/dotansimha/graphql-code-generator/pull/10155) [`ed71811`](https://github.com/dotansimha/graphql-code-generator/commit/ed71811ace083be61c575609e361c629ed7c1740) Thanks [@nebbles](https://github.com/nebbles)! - client-preset generated output is configurable with onlyOperationTypes and onlyEnumTypes

### Patch Changes

- Updated dependencies [[`60dd72f`](https://github.com/dotansimha/graphql-code-generator/commit/60dd72fb103fd7fd70b4e1def98da29588865517)]:
  - @graphql-codegen/visitor-plugin-common@5.6.1
  - @graphql-codegen/gql-tag-operations@4.0.13
  - @graphql-codegen/typescript-operations@4.4.1
  - @graphql-codegen/typed-document-node@5.0.13
  - @graphql-codegen/typescript@4.1.3

## 4.5.1

### Patch Changes

- [#9981](https://github.com/dotansimha/graphql-code-generator/pull/9981) [`05aa6b4`](https://github.com/dotansimha/graphql-code-generator/commit/05aa6b4cee6214674b25c9d20df27ce5e0e3927c) Thanks [@azu](https://github.com/azu)! - The client preset now allows the use of the `enumsAsConst` config option

- Updated dependencies [[`1617e3c`](https://github.com/dotansimha/graphql-code-generator/commit/1617e3cf38f3059cc5ea88b540033f521f03725a), [`fa64fbf`](https://github.com/dotansimha/graphql-code-generator/commit/fa64fbf8a44e1cee7ae17806dcd178dc7350c4ba)]:
  - @graphql-codegen/visitor-plugin-common@5.6.0
  - @graphql-codegen/typescript-operations@4.4.0
  - @graphql-codegen/gql-tag-operations@4.0.12
  - @graphql-codegen/typed-document-node@5.0.12
  - @graphql-codegen/typescript@4.1.2

## 4.5.0

### Minor Changes

- [#10136](https://github.com/dotansimha/graphql-code-generator/pull/10136) [`3fd4486`](https://github.com/dotansimha/graphql-code-generator/commit/3fd4486a548c27099377c7bd696a22d1638227f4) Thanks [@wxt2005](https://github.com/wxt2005)! - foward skipTypeNameForRoot to client-preset

### Patch Changes

- [#10182](https://github.com/dotansimha/graphql-code-generator/pull/10182) [`effd875`](https://github.com/dotansimha/graphql-code-generator/commit/effd875b205fa9c5a99ce5e7fcdeb86cea7723fc) Thanks [@eddeee888](https://github.com/eddeee888)! - Revert slimmer client preset output

- Updated dependencies [[`55a1e9e`](https://github.com/dotansimha/graphql-code-generator/commit/55a1e9e63830df17ed40602ea7e322bbf48b17bc), [`a235051`](https://github.com/dotansimha/graphql-code-generator/commit/a23505180ac2f275a55ece27162ec9bfcdc52e03), [`c7af639`](https://github.com/dotansimha/graphql-code-generator/commit/c7af63964089938150402db69d49f11f93bb5175)]:
  - @graphql-codegen/visitor-plugin-common@5.5.0
  - @graphql-codegen/plugin-helpers@5.1.0
  - @graphql-codegen/typed-document-node@5.0.11
  - @graphql-codegen/gql-tag-operations@4.0.11
  - @graphql-codegen/typescript-operations@4.3.1
  - @graphql-codegen/typescript@4.1.1

## 4.4.0

### Minor Changes

- [#10073](https://github.com/dotansimha/graphql-code-generator/pull/10073) [`8471a18`](https://github.com/dotansimha/graphql-code-generator/commit/8471a180cd61dc03dedace87876c5973b09b35f8) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Reduce noise of generated code by only generating code relevant to GraphQL operations.

### Patch Changes

- [#10075](https://github.com/dotansimha/graphql-code-generator/pull/10075) [`67e7556`](https://github.com/dotansimha/graphql-code-generator/commit/67e75561a3e862f26cfbb40e8ec5a08f821f9ddf) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Add note about enabling bundle size reduction for the generated `graphql` tag file.

- Updated dependencies [[`67e7556`](https://github.com/dotansimha/graphql-code-generator/commit/67e75561a3e862f26cfbb40e8ec5a08f821f9ddf), [`3f4f546`](https://github.com/dotansimha/graphql-code-generator/commit/3f4f5466ff168ad822b9a00d83d3779078e6d8c4)]:
  - @graphql-codegen/gql-tag-operations@4.0.10
  - @graphql-codegen/visitor-plugin-common@5.4.0
  - @graphql-codegen/typescript-operations@4.3.0
  - @graphql-codegen/typescript@4.1.0
  - @graphql-codegen/typed-document-node@5.0.10

## 4.3.3

### Patch Changes

- [#9817](https://github.com/dotansimha/graphql-code-generator/pull/9817) [`7ac42a3`](https://github.com/dotansimha/graphql-code-generator/commit/7ac42a33915985b9504bc16f38a22e057bbcd1ab) Thanks [@nikitalocalhost](https://github.com/nikitalocalhost)! - Resolve runtime error when using the babel plugin within an ESM environment.

## 4.3.2

### Patch Changes

- Updated dependencies [[`79fee3c`](https://github.com/dotansimha/graphql-code-generator/commit/79fee3cada20d683d250aad5aa5fef9d6ed9f4d2)]:
  - @graphql-codegen/visitor-plugin-common@5.3.1
  - @graphql-codegen/gql-tag-operations@4.0.9
  - @graphql-codegen/typescript-operations@4.2.3
  - @graphql-codegen/typed-document-node@5.0.9
  - @graphql-codegen/typescript@4.0.9

## 4.3.1

### Patch Changes

- Updated dependencies [[`808ada5`](https://github.com/dotansimha/graphql-code-generator/commit/808ada595d83d39cad045da5824cac6378e9eca3), [`14ce39e`](https://github.com/dotansimha/graphql-code-generator/commit/14ce39e41dfee38c652be736664177fa2b1df421)]:
  - @graphql-codegen/visitor-plugin-common@5.3.0
  - @graphql-codegen/gql-tag-operations@4.0.8
  - @graphql-codegen/typescript-operations@4.2.2
  - @graphql-codegen/typed-document-node@5.0.8
  - @graphql-codegen/typescript@4.0.8

## 4.3.0

### Minor Changes

- [#10001](https://github.com/dotansimha/graphql-code-generator/pull/10001) [`1be6e65`](https://github.com/dotansimha/graphql-code-generator/commit/1be6e65943b85162f3d465189d0a6df4b962df5d) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Support discriminating `null` and `undefined` within the `useFragment` function.

  ```ts
  function MyComponent(props: FragmentType<typeof MyFragment> | null) {
    const data = useFragment(MyFragment, props)
    // data is `MyFragment | null`
  }

  function MyComponent(props: FragmentType<typeof MyFragment> | undefined) {
    const data = useFragment(MyFragment, props)
    // data is `MyFragment | undefined`
  }
  ```

  Before, the returned type from `useFragment` was always `TType | null | undefined`.

- [#9804](https://github.com/dotansimha/graphql-code-generator/pull/9804) [`5e594ef`](https://github.com/dotansimha/graphql-code-generator/commit/5e594ef8f39b9e1036b6bcaa977f914a66fec03e) Thanks [@rachel-church](https://github.com/rachel-church)! - Preserving `Array<T>` or `ReadonlyArray<T>` in `useFragment()` return type.

### Patch Changes

- [#9996](https://github.com/dotansimha/graphql-code-generator/pull/9996) [`99f449c`](https://github.com/dotansimha/graphql-code-generator/commit/99f449c8dcd645d49eda26e4ddfcb8ad7056ecbf) Thanks [@nahn20](https://github.com/nahn20)! - Added configuration to allow for custom hash functions for persisted documents in the client preset

  ### Example

  ```ts filename="codegen.ts" {10-12}
  import { type CodegenConfig } from '@graphql-codegen/cli'

  const config: CodegenConfig = {
    schema: 'schema.graphql',
    documents: ['src/**/*.tsx'],
    generates: {
      './src/gql/': {
        preset: 'client',
        presetConfig: {
          persistedDocuments: {
            hashAlgorithm: operation => {
              const shasum = crypto.createHash('sha512')
              shasum.update(operation)
              return shasum.digest('hex')
            }
          }
        }
      }
    }
  }
  ```

- Updated dependencies [[`5501c62`](https://github.com/dotansimha/graphql-code-generator/commit/5501c621f19eb5ef8e703a21f7367e07e41f199c)]:
  - @graphql-codegen/add@5.0.3

## 4.2.6

### Patch Changes

- Updated dependencies [[`dfc5310`](https://github.com/dotansimha/graphql-code-generator/commit/dfc5310ab476bed6deaefc608f311ff368722f7e), [`156cc2b`](https://github.com/dotansimha/graphql-code-generator/commit/156cc2b9a2a5129beba121cfa987b04e29899431), [`dfc5310`](https://github.com/dotansimha/graphql-code-generator/commit/dfc5310ab476bed6deaefc608f311ff368722f7e), [`b49457b`](https://github.com/dotansimha/graphql-code-generator/commit/b49457b5f29328d2dc23c642788a2e697cb8966e)]:
  - @graphql-codegen/plugin-helpers@5.0.4
  - @graphql-codegen/visitor-plugin-common@5.2.0
  - @graphql-codegen/gql-tag-operations@4.0.7
  - @graphql-codegen/typescript-operations@4.2.1
  - @graphql-codegen/typed-document-node@5.0.7
  - @graphql-codegen/typescript@4.0.7

## 4.2.5

### Patch Changes

- [#9889](https://github.com/dotansimha/graphql-code-generator/pull/9889) [`cd60e14`](https://github.com/dotansimha/graphql-code-generator/commit/cd60e14c4dc5a496a93089dae677fc797c04671e) Thanks [@Sojaner](https://github.com/Sojaner)! - Omit `__typename` from being added on the root node of a subscription when using `addTypenameSelectionDocumentTransform` with documentTransforms since a single root node is expected and the code generator fails because of that (refer to https://spec.graphql.org/draft/#sec-Single-root-field)

## 4.2.4

### Patch Changes

- Updated dependencies [[`920b443`](https://github.com/dotansimha/graphql-code-generator/commit/920b443a401b8cc4811f64ec5b25fc7b4ae32b53), [`ed9c205`](https://github.com/dotansimha/graphql-code-generator/commit/ed9c205d15d7f14ed73e54aecf40e4fad5664e9d)]:
  - @graphql-codegen/visitor-plugin-common@5.1.0
  - @graphql-codegen/typescript-operations@4.2.0
  - @graphql-codegen/gql-tag-operations@4.0.6
  - @graphql-codegen/typed-document-node@5.0.6
  - @graphql-codegen/typescript@4.0.6

## 4.2.3

### Patch Changes

- Updated dependencies [[`53f270a`](https://github.com/dotansimha/graphql-code-generator/commit/53f270acfa1da992e0f9d2e50921bb588392f8a5)]:
  - @graphql-codegen/visitor-plugin-common@5.0.0
  - @graphql-codegen/gql-tag-operations@4.0.5
  - @graphql-codegen/typescript-operations@4.1.3
  - @graphql-codegen/typed-document-node@5.0.5
  - @graphql-codegen/typescript@4.0.5

## 4.2.2

### Patch Changes

- [#9813](https://github.com/dotansimha/graphql-code-generator/pull/9813) [`4e69568`](https://github.com/dotansimha/graphql-code-generator/commit/4e6956899c96f8954cea8d5bbe32aa35a70cc653) Thanks [@saihaj](https://github.com/saihaj)! - bumping for a release

- Updated dependencies [[`4e69568`](https://github.com/dotansimha/graphql-code-generator/commit/4e6956899c96f8954cea8d5bbe32aa35a70cc653)]:
  - @graphql-codegen/visitor-plugin-common@4.1.2
  - @graphql-codegen/typescript-operations@4.1.2
  - @graphql-codegen/add@5.0.2
  - @graphql-codegen/gql-tag-operations@4.0.4
  - @graphql-codegen/typed-document-node@5.0.4
  - @graphql-codegen/typescript@4.0.4
  - @graphql-codegen/plugin-helpers@5.0.3

## 4.2.1

### Patch Changes

- [#9557](https://github.com/dotansimha/graphql-code-generator/pull/9557) [`48ddaeae1`](https://github.com/dotansimha/graphql-code-generator/commit/48ddaeae1809cb52e6de5aa14f0d47bedde9d547) Thanks [@konomae](https://github.com/konomae)! - Add eslint-disable comment to fragment-masking.ts

- Updated dependencies [[`7718a8113`](https://github.com/dotansimha/graphql-code-generator/commit/7718a8113dc6282475cb738f1e28698b8221fa2f)]:
  - @graphql-codegen/visitor-plugin-common@4.1.1
  - @graphql-codegen/gql-tag-operations@4.0.3
  - @graphql-codegen/typescript-operations@4.1.1
  - @graphql-codegen/typed-document-node@5.0.3
  - @graphql-codegen/typescript@4.0.3

## 4.2.0

### Minor Changes

- [#9811](https://github.com/dotansimha/graphql-code-generator/pull/9811) [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975) Thanks [@saihaj](https://github.com/saihaj)! - The client preset now allows the use of the `futureProofEnums` config option

### Patch Changes

- [#9811](https://github.com/dotansimha/graphql-code-generator/pull/9811) [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975) Thanks [@saihaj](https://github.com/saihaj)! - dependencies updates:
  - Updated dependency [`tslib@~2.6.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.6.0) (from `~2.5.0`, in `dependencies`)
- Updated dependencies [[`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975)]:
  - @graphql-codegen/add@5.0.1
  - @graphql-codegen/gql-tag-operations@4.0.2
  - @graphql-codegen/plugin-helpers@5.0.2
  - @graphql-codegen/typed-document-node@5.0.2
  - @graphql-codegen/typescript@4.0.2
  - @graphql-codegen/typescript-operations@4.1.0
  - @graphql-codegen/visitor-plugin-common@4.1.0

## 4.1.0

### Minor Changes

- [#9562](https://github.com/dotansimha/graphql-code-generator/pull/9562) [`5beee9794`](https://github.com/dotansimha/graphql-code-generator/commit/5beee9794de208fed17e516a259535f56d626c9d) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Add the `addTypenameSelectionDocumentTransform` for automatically adding `__typename` selections to all objct type selection sets.

  This is useful for GraphQL Clients such as Apollo Client or urql that need typename information for their cache to function.

  **Example Usage**

  ```
  import { addTypenameSelectionDocumentTransform } from '@graphql-codegen/client-preset';
  import { CodegenConfig } from "@graphql-codegen/cli";

  const config: CodegenConfig = {
    schema: "YOUR_GRAPHQL_ENDPOINT",
    documents: ["./**/*.{ts,tsx}"],
    ignoreNoDocuments: true,
    generates: {
      "./gql/": {
        preset: "client",
        plugins: [],
        presetConfig: {
          persistedDocuments: true,
        },
        documentTransforms: [addTypenameSelectionDocumentTransform],
      },
    },
  };

  export default config;
  ```

### Patch Changes

- Updated dependencies [[`bb1e0e96e`](https://github.com/dotansimha/graphql-code-generator/commit/bb1e0e96ed9d519684630cd7ea53869b48b4632e)]:
  - @graphql-codegen/plugin-helpers@5.0.1

## 4.0.1

### Patch Changes

- [#9497](https://github.com/dotansimha/graphql-code-generator/pull/9497) [`2276708d0`](https://github.com/dotansimha/graphql-code-generator/commit/2276708d0ea2aab4942136923651226de4aabe5a) Thanks [@eddeee888](https://github.com/eddeee888)! - Revert default ID scalar input type to string

  We changed the ID Scalar input type from `string` to `string | number` in the latest major version of `typescript` plugin. This causes issues for server plugins (e.g. typescript-resolvers) that depends on `typescript` plugin. This is because the scalar type needs to be manually inverted on setup which is confusing.

- Updated dependencies [[`2276708d0`](https://github.com/dotansimha/graphql-code-generator/commit/2276708d0ea2aab4942136923651226de4aabe5a)]:
  - @graphql-codegen/visitor-plugin-common@4.0.1
  - @graphql-codegen/typescript-operations@4.0.1
  - @graphql-codegen/typescript@4.0.1
  - @graphql-codegen/gql-tag-operations@4.0.1
  - @graphql-codegen/typed-document-node@5.0.1

## 4.0.0

### Major Changes

- [`bb66c2a31`](https://github.com/dotansimha/graphql-code-generator/commit/bb66c2a31985c1375912ccd6b2b02933f313c9c0) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Require Node.js `>= 16`. Drop support for Node.js 14

### Minor Changes

- [#9196](https://github.com/dotansimha/graphql-code-generator/pull/9196) [`3848a2b73`](https://github.com/dotansimha/graphql-code-generator/commit/3848a2b73339fe9f474b31647b71e75b9ca52a96) Thanks [@beerose](https://github.com/beerose)! - Add `@defer` directive support

  When a query includes a deferred fragment field, the server will return a partial response with the non-deferred fields first, followed by the remaining fields once they have been resolved.

  Once start using the `@defer` directive in your queries, the generated code will automatically include support for the directive.

  ```jsx
  // src/index.tsx
  import { graphql } from './gql'
  const OrdersFragment = graphql(`
    fragment OrdersFragment on User {
      orders {
        id
        total
      }
    }
  `)
  const GetUserQuery = graphql(`
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        ...OrdersFragment @defer
      }
    }
  `)
  ```

  The generated type for `GetUserQuery` will have information that the fragment is _incremental,_ meaning it may not be available right away.

  ```tsx
  // gql/graphql.ts
  export type GetUserQuery = { __typename?: 'Query'; id: string; name: string } & ({
    __typename?: 'Query'
  } & {
    ' $fragmentRefs'?: { OrdersFragment: Incremental<OrdersFragment> }
  })
  ```

  Apart from generating code that includes support for the `@defer` directive, the Codegen also exports a utility function called `isFragmentReady`. You can use it to conditionally render components based on whether the data for a deferred
  fragment is available:

  ```jsx
  const OrdersList = (props: { data: FragmentType<typeof OrdersFragment> }) => {
    const data = useFragment(OrdersFragment, props.data);
    return (
      // render orders list
    )
  };

  function App() {
    const { data } = useQuery(GetUserQuery);
    return (
      {data && (
        <>
          {isFragmentReady(GetUserQuery, OrdersFragment, data)
  					&& <OrdersList data={data} />}
        </>
      )}
    );
  }
  export default App;
  ```

- [#9353](https://github.com/dotansimha/graphql-code-generator/pull/9353) [`d7e335b58`](https://github.com/dotansimha/graphql-code-generator/commit/d7e335b5874a821c9f609c66d554921ed8c6de19) Thanks [@charpeni](https://github.com/charpeni)! - Implement the ability the specify the hash algorithm used for persisted documents via `persistedDocuments.hashAlgorithm`

### Patch Changes

- [#9449](https://github.com/dotansimha/graphql-code-generator/pull/9449) [`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2) Thanks [@n1ru4l](https://github.com/n1ru4l)! - dependencies updates:

  - Updated dependency [`@graphql-tools/documents@^1.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/documents/v/1.0.0) (from `^0.1.0`, in `dependencies`)
  - Updated dependency [`@graphql-tools/utils@^10.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/10.0.0) (from `^9.0.0`, in `dependencies`)

- [#9315](https://github.com/dotansimha/graphql-code-generator/pull/9315) [`6d2de206a`](https://github.com/dotansimha/graphql-code-generator/commit/6d2de206abdcce9e176bbc157cd27b37a20b0f97) Thanks [@luvejo](https://github.com/luvejo)! - improve error message

- [#9385](https://github.com/dotansimha/graphql-code-generator/pull/9385) [`a7dda3546`](https://github.com/dotansimha/graphql-code-generator/commit/a7dda3546567b5bb70015fc3ae197562231d7911) Thanks [@beerose](https://github.com/beerose)! - Improve isFragmentReady utility function to work with noUncheckedIndexedAccess TSC setting

- [#9196](https://github.com/dotansimha/graphql-code-generator/pull/9196) [`3848a2b73`](https://github.com/dotansimha/graphql-code-generator/commit/3848a2b73339fe9f474b31647b71e75b9ca52a96) Thanks [@beerose](https://github.com/beerose)! - Pass `emitLegacyCommonJSImports` and `isStringDocumentMode` to the client preset config

- [#9414](https://github.com/dotansimha/graphql-code-generator/pull/9414) [`ca02ad172`](https://github.com/dotansimha/graphql-code-generator/commit/ca02ad172a0e8f52570fdef4271ec286d883236d) Thanks [@beerose](https://github.com/beerose)! - Include nested fragments in string documentMode

- Updated dependencies [[`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2), [`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2), [`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2), [`f46803a8c`](https://github.com/dotansimha/graphql-code-generator/commit/f46803a8c70840280529a52acbb111c865712af2), [`3848a2b73`](https://github.com/dotansimha/graphql-code-generator/commit/3848a2b73339fe9f474b31647b71e75b9ca52a96), [`ba84a3a27`](https://github.com/dotansimha/graphql-code-generator/commit/ba84a3a2758d94dac27fcfbb1bafdf3ed7c32929), [`63827fabe`](https://github.com/dotansimha/graphql-code-generator/commit/63827fabede76b2380d40392aba2a3ccb099f0c4), [`50471e651`](https://github.com/dotansimha/graphql-code-generator/commit/50471e6514557db827cd26157262401c6c600a8c), [`5aa95aa96`](https://github.com/dotansimha/graphql-code-generator/commit/5aa95aa969993043ba5e9d5dabebd7127ea5e22c), [`ca02ad172`](https://github.com/dotansimha/graphql-code-generator/commit/ca02ad172a0e8f52570fdef4271ec286d883236d), [`e1dc75f3c`](https://github.com/dotansimha/graphql-code-generator/commit/e1dc75f3c598bf7f83138ca533619716fc73f823), [`bb66c2a31`](https://github.com/dotansimha/graphql-code-generator/commit/bb66c2a31985c1375912ccd6b2b02933f313c9c0), [`5950f5a68`](https://github.com/dotansimha/graphql-code-generator/commit/5950f5a6843cdd92b9d5b8ced3a97b68eadf9f30), [`5aa95aa96`](https://github.com/dotansimha/graphql-code-generator/commit/5aa95aa969993043ba5e9d5dabebd7127ea5e22c)]:
  - @graphql-codegen/gql-tag-operations@4.0.0
  - @graphql-codegen/plugin-helpers@5.0.0
  - @graphql-codegen/visitor-plugin-common@4.0.0
  - @graphql-codegen/typed-document-node@5.0.0
  - @graphql-codegen/typescript-operations@4.0.0
  - @graphql-codegen/typescript@4.0.0
  - @graphql-codegen/add@5.0.0

## 3.0.1

### Patch Changes

- Updated dependencies [[`386cf9044`](https://github.com/dotansimha/graphql-code-generator/commit/386cf9044a41d87ed45069b22d26b30f4b262a85), [`402cb8ac0`](https://github.com/dotansimha/graphql-code-generator/commit/402cb8ac0f0c347b186d295c4b69c19e25a65d00)]:
  - @graphql-codegen/visitor-plugin-common@3.1.1
  - @graphql-codegen/gql-tag-operations@3.0.1
  - @graphql-codegen/typescript-operations@3.0.4
  - @graphql-codegen/typed-document-node@4.0.1
  - @graphql-codegen/typescript@3.0.4

## 3.0.0

### Major Changes

- [#9137](https://github.com/dotansimha/graphql-code-generator/pull/9137) [`2256c8b5d`](https://github.com/dotansimha/graphql-code-generator/commit/2256c8b5d0e13057d35692bbeba3b7b8f94d8712) Thanks [@beerose](https://github.com/beerose)! - Add `TypedDocumentNode` string alternative that doesn't require GraphQL AST on the client. This change requires `@graphql-typed-document-node/core` in version `3.2.0` or higher.

### Patch Changes

- [#9137](https://github.com/dotansimha/graphql-code-generator/pull/9137) [`2256c8b5d`](https://github.com/dotansimha/graphql-code-generator/commit/2256c8b5d0e13057d35692bbeba3b7b8f94d8712) Thanks [@beerose](https://github.com/beerose)! - dependencies updates:
  - Updated dependency [`@graphql-typed-document-node/core@3.2.0` ↗︎](https://www.npmjs.com/package/@graphql-typed-document-node/core/v/3.2.0) (from `3.1.2`, in `dependencies`)
- Updated dependencies [[`e56790104`](https://github.com/dotansimha/graphql-code-generator/commit/e56790104ae56d6c5b48ef71823345bd09d3b835), [`b7dacb21f`](https://github.com/dotansimha/graphql-code-generator/commit/b7dacb21fb0ed1173d1e45120dc072e29231ed29), [`f104619ac`](https://github.com/dotansimha/graphql-code-generator/commit/f104619acd27c9d62a06bc577737500880731087), [`92d86b009`](https://github.com/dotansimha/graphql-code-generator/commit/92d86b009579edf70f60b0b8e28658af93ff9fd1), [`2256c8b5d`](https://github.com/dotansimha/graphql-code-generator/commit/2256c8b5d0e13057d35692bbeba3b7b8f94d8712), [`acb647e4e`](https://github.com/dotansimha/graphql-code-generator/commit/acb647e4efbddecf732b6e55dc47ac40c9bdaf08), [`9f4d9c5a4`](https://github.com/dotansimha/graphql-code-generator/commit/9f4d9c5a479d34da25df8e060a8c2b3b162647dd)]:
  - @graphql-codegen/visitor-plugin-common@3.1.0
  - @graphql-codegen/plugin-helpers@4.2.0
  - @graphql-codegen/typescript@3.0.3
  - @graphql-codegen/typed-document-node@4.0.0
  - @graphql-codegen/gql-tag-operations@3.0.0
  - @graphql-codegen/typescript-operations@3.0.3

## 2.1.1

### Patch Changes

- [#9049](https://github.com/dotansimha/graphql-code-generator/pull/9049) [`9430c3811`](https://github.com/dotansimha/graphql-code-generator/commit/9430c38111579c8c0023cbabfae047156ae2df42) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`@graphql-typed-document-node/core@3.1.2` ↗︎](https://www.npmjs.com/package/@graphql-typed-document-node/core/v/3.1.2) (from `3.1.1`, in `dependencies`)
- Updated dependencies [[`ba0610bbd`](https://github.com/dotansimha/graphql-code-generator/commit/ba0610bbd4578d8a82078014766f56d8ae5fcf7a), [`4b49f6fbe`](https://github.com/dotansimha/graphql-code-generator/commit/4b49f6fbed802907b460bfb7b6e9a85f88c555bc), [`b343626c9`](https://github.com/dotansimha/graphql-code-generator/commit/b343626c978b9ee0f14e314cea6c01ae3dad057c)]:
  - @graphql-codegen/visitor-plugin-common@3.0.2
  - @graphql-codegen/gql-tag-operations@2.0.2
  - @graphql-codegen/typescript-operations@3.0.2
  - @graphql-codegen/typed-document-node@3.0.2
  - @graphql-codegen/typescript@3.0.2

## 2.1.0

### Minor Changes

- [#8893](https://github.com/dotansimha/graphql-code-generator/pull/8893) [`a118c307a`](https://github.com/dotansimha/graphql-code-generator/commit/a118c307a35bbb97b7cbca0f178a88276032a26c) Thanks [@n1ru4l](https://github.com/n1ru4l)! - It is no longer mandatory to declare an empty plugins array when using a preset

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

- [#8995](https://github.com/dotansimha/graphql-code-generator/pull/8995) [`fe2e9c7a5`](https://github.com/dotansimha/graphql-code-generator/commit/fe2e9c7a5f2731e06dd285e391936608dfa3fb51) Thanks [@charpeni](https://github.com/charpeni)! - Use `gqlTagName` for generated examples

- [#8971](https://github.com/dotansimha/graphql-code-generator/pull/8971) [`6b6fe3cbc`](https://github.com/dotansimha/graphql-code-generator/commit/6b6fe3cbcc7de748754703adce0f62f3e070a098) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Allow passing fragment documents to APIs like Apollos `readFragment`

- Updated dependencies [[`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`a118c307a`](https://github.com/dotansimha/graphql-code-generator/commit/a118c307a35bbb97b7cbca0f178a88276032a26c), [`fe2e9c7a5`](https://github.com/dotansimha/graphql-code-generator/commit/fe2e9c7a5f2731e06dd285e391936608dfa3fb51), [`6b6fe3cbc`](https://github.com/dotansimha/graphql-code-generator/commit/6b6fe3cbcc7de748754703adce0f62f3e070a098), [`6b6fe3cbc`](https://github.com/dotansimha/graphql-code-generator/commit/6b6fe3cbcc7de748754703adce0f62f3e070a098), [`a3309e63e`](https://github.com/dotansimha/graphql-code-generator/commit/a3309e63efed880e6f74ce6fcbf82dd3d7857a15)]:
  - @graphql-codegen/add@4.0.1
  - @graphql-codegen/gql-tag-operations@2.0.1
  - @graphql-codegen/plugin-helpers@4.1.0
  - @graphql-codegen/typed-document-node@3.0.1
  - @graphql-codegen/typescript@3.0.1
  - @graphql-codegen/typescript-operations@3.0.1
  - @graphql-codegen/visitor-plugin-common@3.0.1

## 2.0.0

### Major Changes

- [#8885](https://github.com/dotansimha/graphql-code-generator/pull/8885) [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d) Thanks [@n1ru4l](https://github.com/n1ru4l)! - drop Node.js 12 support

### Patch Changes

- [#8885](https://github.com/dotansimha/graphql-code-generator/pull/8885) [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d) Thanks [@n1ru4l](https://github.com/n1ru4l)! - dependencies updates:

  - Updated dependency [`@babel/helper-plugin-utils@^7.20.2` ↗︎](https://www.npmjs.com/package/@babel/helper-plugin-utils/v/7.20.2) (from `^7.14.5`, in `dependencies`)
  - Updated dependency [`@babel/template@^7.20.7` ↗︎](https://www.npmjs.com/package/@babel/template/v/7.20.7) (from `^7.15.4`, in `dependencies`)

- [#8871](https://github.com/dotansimha/graphql-code-generator/pull/8871) [`fc79b65d4`](https://github.com/dotansimha/graphql-code-generator/commit/fc79b65d4914fd25ae6bd5d58ebc7ded573a08a5) Thanks [@B2o5T](https://github.com/B2o5T)! - eslint fixes

- Updated dependencies [[`fc79b65d4`](https://github.com/dotansimha/graphql-code-generator/commit/fc79b65d4914fd25ae6bd5d58ebc7ded573a08a5), [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d)]:
  - @graphql-codegen/visitor-plugin-common@3.0.0
  - @graphql-codegen/plugin-helpers@4.0.0
  - @graphql-codegen/add@4.0.0
  - @graphql-codegen/gql-tag-operations@2.0.0
  - @graphql-codegen/typescript-operations@3.0.0
  - @graphql-codegen/typed-document-node@3.0.0
  - @graphql-codegen/typescript@3.0.0

## 1.3.0

### Minor Changes

- [#8757](https://github.com/dotansimha/graphql-code-generator/pull/8757) [`4f290aa72`](https://github.com/dotansimha/graphql-code-generator/commit/4f290aa7279a05ffa40920c1c9e5e5b37c164335) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Add support for persisted documents.

  You can now generate and embed a persisted documents hash for the executable documents.

  ```ts
  /** codegen.ts */
  import { CodegenConfig } from '@graphql-codegen/cli'

  const config: CodegenConfig = {
    schema: 'https://graphql.org/graphql/',
    documents: ['src/**/*.tsx'],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
      './src/gql/': {
        preset: 'client',
        plugins: [],
        presetConfig: {
          persistedDocuments: true
        }
      }
    }
  }

  export default config
  ```

  This will generate `./src/gql/persisted-documents.json` (dictionary of hashes with their operation string).

  In addition to that each generated document node will have a `__meta__.hash` property.

  ```ts
  import { gql } from './gql.js'

  const allFilmsWithVariablesQueryDocument = graphql(/* GraphQL */ `
    query allFilmsWithVariablesQuery($first: Int!) {
      allFilms(first: $first) {
        edges {
          node {
            ...FilmItem
          }
        }
      }
    }
  `)

  console.log((allFilmsWithVariablesQueryDocument as any)['__meta__']['hash'])
  ```

- [#8757](https://github.com/dotansimha/graphql-code-generator/pull/8757) [`4f290aa72`](https://github.com/dotansimha/graphql-code-generator/commit/4f290aa7279a05ffa40920c1c9e5e5b37c164335) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Add support for embedding metadata in the document AST.

  It is now possible to embed metadata (e.g. for your GraphQL client within the emitted code).

  ```ts
  /** codegen.ts */
  import { CodegenConfig } from '@graphql-codegen/cli'

  const config: CodegenConfig = {
    schema: 'https://graphql.org/graphql/',
    documents: ['src/**/*.tsx'],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
      './src/gql/': {
        preset: 'client',
        plugins: [],
        presetConfig: {
          onExecutableDocumentNode(documentNode) {
            return {
              operation: documentNode.definitions[0].operation,
              name: documentNode.definitions[0].name.value
            }
          }
        }
      }
    }
  }

  export default config
  ```

  You can then access the metadata via the `__meta__` property on the document node.

  ```ts
  import { gql } from './gql.js'

  const allFilmsWithVariablesQueryDocument = graphql(/* GraphQL */ `
    query allFilmsWithVariablesQuery($first: Int!) {
      allFilms(first: $first) {
        edges {
          node {
            ...FilmItem
          }
        }
      }
    }
  `)

  console.log((allFilmsWithVariablesQueryDocument as any)['__meta__'])
  ```

### Patch Changes

- [#8757](https://github.com/dotansimha/graphql-code-generator/pull/8757) [`4f290aa72`](https://github.com/dotansimha/graphql-code-generator/commit/4f290aa7279a05ffa40920c1c9e5e5b37c164335) Thanks [@n1ru4l](https://github.com/n1ru4l)! - dependencies updates:
  - Added dependency [`@graphql-tools/documents@^0.1.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/documents/v/0.1.0) (to `dependencies`)
- Updated dependencies [[`a98198524`](https://github.com/dotansimha/graphql-code-generator/commit/a9819852443884b43de7c15040ccffc205f9177a)]:
  - @graphql-codegen/visitor-plugin-common@2.13.8
  - @graphql-codegen/gql-tag-operations@1.6.2
  - @graphql-codegen/typescript-operations@2.5.13
  - @graphql-codegen/typed-document-node@2.3.13
  - @graphql-codegen/typescript@2.8.8

## 1.2.6

### Patch Changes

- [#8796](https://github.com/dotansimha/graphql-code-generator/pull/8796) [`902451601`](https://github.com/dotansimha/graphql-code-generator/commit/902451601b5edf9cb7768e57f332fe6ade79c20a) Thanks [@shmax](https://github.com/shmax)! - remove extra asterisk and add missing semicolon in generated output

- Updated dependencies [[`902451601`](https://github.com/dotansimha/graphql-code-generator/commit/902451601b5edf9cb7768e57f332fe6ade79c20a)]:
  - @graphql-codegen/gql-tag-operations@1.6.1

## 1.2.5

### Patch Changes

- Updated dependencies [[`eb454d06c`](https://github.com/dotansimha/graphql-code-generator/commit/eb454d06c977f11f7d4a7b0b07eb80f8fd590560), [`2a33fc774`](https://github.com/dotansimha/graphql-code-generator/commit/2a33fc7741f7a9532bef68606666d4e3db7785a3)]:
  - @graphql-codegen/visitor-plugin-common@2.13.7
  - @graphql-codegen/gql-tag-operations@1.6.0
  - @graphql-codegen/typescript-operations@2.5.12
  - @graphql-codegen/typed-document-node@2.3.12
  - @graphql-codegen/typescript@2.8.7

## 1.2.4

### Patch Changes

- [#8771](https://github.com/dotansimha/graphql-code-generator/pull/8771) [`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency [`@graphql-tools/utils@^9.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/9.0.0) (from `^8.8.0`, in `dependencies`)

- [#8752](https://github.com/dotansimha/graphql-code-generator/pull/8752) [`cbca5a7ea`](https://github.com/dotansimha/graphql-code-generator/commit/cbca5a7ea3591f7ccf42399842cddb3581b40cf7) Thanks [@pbrink231](https://github.com/pbrink231)! - add typescript `avoidOptionals` to forwarded config

- Updated dependencies [[`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7), [`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7), [`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7), [`6c6b6f2df`](https://github.com/dotansimha/graphql-code-generator/commit/6c6b6f2df88a3a37b437a25320dab5590f033316)]:
  - @graphql-codegen/gql-tag-operations@1.5.12
  - @graphql-codegen/plugin-helpers@3.1.2
  - @graphql-codegen/visitor-plugin-common@2.13.6
  - @graphql-codegen/typescript-operations@2.5.11
  - @graphql-codegen/typed-document-node@2.3.11
  - @graphql-codegen/typescript@2.8.6

## 1.2.3

### Patch Changes

- [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a) Thanks [@saihaj](https://github.com/saihaj)! - fix the version of `@graphql-codegen/plugin-helpers@3.1.1`

- Updated dependencies [[`307a5d350`](https://github.com/dotansimha/graphql-code-generator/commit/307a5d350643dd065d228b04ef3b4bd70cac0e81), [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a)]:
  - @graphql-codegen/plugin-helpers@3.1.1
  - @graphql-codegen/add@3.2.3
  - @graphql-codegen/visitor-plugin-common@2.13.5
  - @graphql-codegen/gql-tag-operations@1.5.11
  - @graphql-codegen/typescript-operations@2.5.10
  - @graphql-codegen/typed-document-node@2.3.10
  - @graphql-codegen/typescript@2.8.5

## 1.2.2

### Patch Changes

- [#8702](https://github.com/dotansimha/graphql-code-generator/pull/8702) [`0eb0dde8a`](https://github.com/dotansimha/graphql-code-generator/commit/0eb0dde8a0eb89805711287798561a0b14b6dd59) Thanks [@ithinkdancan](https://github.com/ithinkdancan)! - add config for nonOptionalTypename

- Updated dependencies [[`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`f79a00e8a`](https://github.com/dotansimha/graphql-code-generator/commit/f79a00e8ae073eab426ca08795c924e716123482), [`c802a0c0b`](https://github.com/dotansimha/graphql-code-generator/commit/c802a0c0b775cfabc5ace3e7fb6655540c6c4d84)]:
  - @graphql-codegen/plugin-helpers@3.0.0
  - @graphql-codegen/typed-document-node@2.3.9
  - @graphql-codegen/visitor-plugin-common@2.13.4
  - @graphql-codegen/add@3.2.2
  - @graphql-codegen/gql-tag-operations@1.5.10
  - @graphql-codegen/typescript-operations@2.5.9
  - @graphql-codegen/typescript@2.8.4

## 1.2.1

### Patch Changes

- Updated dependencies [[`62f655452`](https://github.com/dotansimha/graphql-code-generator/commit/62f6554520955dd675e11c920f35ef9bf0aaeffe)]:
  - @graphql-codegen/visitor-plugin-common@2.13.3
  - @graphql-codegen/typescript-operations@2.5.8
  - @graphql-codegen/gql-tag-operations@1.5.9
  - @graphql-codegen/typed-document-node@2.3.8
  - @graphql-codegen/typescript@2.8.3

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
