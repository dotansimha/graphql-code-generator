# @graphql-codegen/typed-document-node

## 5.0.2

### Patch Changes

- [#9640](https://github.com/dotansimha/graphql-code-generator/pull/9640) [`40a29e91e`](https://github.com/dotansimha/graphql-code-generator/commit/40a29e91ea25ed5ad6acb15ccca1767dafbdd7c5) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`tslib@~2.6.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.6.0) (from `~2.5.0`, in `dependencies`)
- Updated dependencies [[`40a29e91e`](https://github.com/dotansimha/graphql-code-generator/commit/40a29e91ea25ed5ad6acb15ccca1767dafbdd7c5), [`40a29e91e`](https://github.com/dotansimha/graphql-code-generator/commit/40a29e91ea25ed5ad6acb15ccca1767dafbdd7c5), [`1bed87b20`](https://github.com/dotansimha/graphql-code-generator/commit/1bed87b201b6c0879ef605ec41f5a1acdcbfe1e7), [`43b525d1f`](https://github.com/dotansimha/graphql-code-generator/commit/43b525d1f94a027b01d579d8b2953463f0e4c35a)]:
  - @graphql-codegen/plugin-helpers@5.0.2
  - @graphql-codegen/visitor-plugin-common@4.1.0

## 5.0.1

### Patch Changes

- Updated dependencies [[`2276708d0`](https://github.com/dotansimha/graphql-code-generator/commit/2276708d0ea2aab4942136923651226de4aabe5a)]:
  - @graphql-codegen/visitor-plugin-common@4.0.1

## 5.0.0

### Major Changes

- [`bb66c2a31`](https://github.com/dotansimha/graphql-code-generator/commit/bb66c2a31985c1375912ccd6b2b02933f313c9c0) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Require Node.js `>= 16`. Drop support for Node.js 14

### Minor Changes

- [#9196](https://github.com/dotansimha/graphql-code-generator/pull/9196) [`3848a2b73`](https://github.com/dotansimha/graphql-code-generator/commit/3848a2b73339fe9f474b31647b71e75b9ca52a96) Thanks [@beerose](https://github.com/beerose)! - Add `@defer` directive support

  When a query includes a deferred fragment field, the server will return a partial response with the non-deferred fields first, followed by the remaining fields once they have been resolved.

  Once start using the `@defer` directive in your queries, the generated code will automatically include support for the directive.

  ```jsx
  // src/index.tsx
  import { graphql } from './gql';
  const OrdersFragment = graphql(`
    fragment OrdersFragment on User {
      orders {
        id
        total
      }
    }
  `);
  const GetUserQuery = graphql(`
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        ...OrdersFragment @defer
      }
    }
  `);
  ```

  The generated type for `GetUserQuery` will have information that the fragment is _incremental,_ meaning it may not be available right away.

  ```tsx
  // gql/graphql.ts
  export type GetUserQuery = { __typename?: 'Query'; id: string; name: string } & ({
    __typename?: 'Query';
  } & {
    ' $fragmentRefs'?: { OrdersFragment: Incremental<OrdersFragment> };
  });
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

### Patch Changes

- Updated dependencies [[`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2), [`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2), [`f46803a8c`](https://github.com/dotansimha/graphql-code-generator/commit/f46803a8c70840280529a52acbb111c865712af2), [`3848a2b73`](https://github.com/dotansimha/graphql-code-generator/commit/3848a2b73339fe9f474b31647b71e75b9ca52a96), [`ba84a3a27`](https://github.com/dotansimha/graphql-code-generator/commit/ba84a3a2758d94dac27fcfbb1bafdf3ed7c32929), [`63827fabe`](https://github.com/dotansimha/graphql-code-generator/commit/63827fabede76b2380d40392aba2a3ccb099f0c4), [`50471e651`](https://github.com/dotansimha/graphql-code-generator/commit/50471e6514557db827cd26157262401c6c600a8c), [`5aa95aa96`](https://github.com/dotansimha/graphql-code-generator/commit/5aa95aa969993043ba5e9d5dabebd7127ea5e22c), [`ca02ad172`](https://github.com/dotansimha/graphql-code-generator/commit/ca02ad172a0e8f52570fdef4271ec286d883236d), [`e1dc75f3c`](https://github.com/dotansimha/graphql-code-generator/commit/e1dc75f3c598bf7f83138ca533619716fc73f823), [`bb66c2a31`](https://github.com/dotansimha/graphql-code-generator/commit/bb66c2a31985c1375912ccd6b2b02933f313c9c0), [`5950f5a68`](https://github.com/dotansimha/graphql-code-generator/commit/5950f5a6843cdd92b9d5b8ced3a97b68eadf9f30), [`5aa95aa96`](https://github.com/dotansimha/graphql-code-generator/commit/5aa95aa969993043ba5e9d5dabebd7127ea5e22c)]:
  - @graphql-codegen/plugin-helpers@5.0.0
  - @graphql-codegen/visitor-plugin-common@4.0.0

## 4.0.1

### Patch Changes

- Updated dependencies [[`386cf9044`](https://github.com/dotansimha/graphql-code-generator/commit/386cf9044a41d87ed45069b22d26b30f4b262a85), [`402cb8ac0`](https://github.com/dotansimha/graphql-code-generator/commit/402cb8ac0f0c347b186d295c4b69c19e25a65d00)]:
  - @graphql-codegen/visitor-plugin-common@3.1.1

## 4.0.0

### Major Changes

- [#9137](https://github.com/dotansimha/graphql-code-generator/pull/9137) [`2256c8b5d`](https://github.com/dotansimha/graphql-code-generator/commit/2256c8b5d0e13057d35692bbeba3b7b8f94d8712) Thanks [@beerose](https://github.com/beerose)! - Add `TypedDocumentNode` string alternative that doesn't require GraphQL AST on the client. This change requires `@graphql-typed-document-node/core` in version `3.2.0` or higher.

### Patch Changes

- Updated dependencies [[`e56790104`](https://github.com/dotansimha/graphql-code-generator/commit/e56790104ae56d6c5b48ef71823345bd09d3b835), [`b7dacb21f`](https://github.com/dotansimha/graphql-code-generator/commit/b7dacb21fb0ed1173d1e45120dc072e29231ed29), [`f104619ac`](https://github.com/dotansimha/graphql-code-generator/commit/f104619acd27c9d62a06bc577737500880731087), [`acb647e4e`](https://github.com/dotansimha/graphql-code-generator/commit/acb647e4efbddecf732b6e55dc47ac40c9bdaf08), [`9f4d9c5a4`](https://github.com/dotansimha/graphql-code-generator/commit/9f4d9c5a479d34da25df8e060a8c2b3b162647dd)]:
  - @graphql-codegen/visitor-plugin-common@3.1.0
  - @graphql-codegen/plugin-helpers@4.2.0

## 3.0.2

### Patch Changes

- Updated dependencies [[`ba0610bbd`](https://github.com/dotansimha/graphql-code-generator/commit/ba0610bbd4578d8a82078014766f56d8ae5fcf7a), [`4b49f6fbe`](https://github.com/dotansimha/graphql-code-generator/commit/4b49f6fbed802907b460bfb7b6e9a85f88c555bc), [`b343626c9`](https://github.com/dotansimha/graphql-code-generator/commit/b343626c978b9ee0f14e314cea6c01ae3dad057c)]:
  - @graphql-codegen/visitor-plugin-common@3.0.2

## 3.0.1

### Patch Changes

- [#8879](https://github.com/dotansimha/graphql-code-generator/pull/8879) [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency [`tslib@~2.5.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.5.0) (from `~2.4.0`, in `dependencies`)

- [#8971](https://github.com/dotansimha/graphql-code-generator/pull/8971) [`6b6fe3cbc`](https://github.com/dotansimha/graphql-code-generator/commit/6b6fe3cbcc7de748754703adce0f62f3e070a098) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Allow passing fragment documents to APIs like Apollos `readFragment`

- Updated dependencies [[`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`a118c307a`](https://github.com/dotansimha/graphql-code-generator/commit/a118c307a35bbb97b7cbca0f178a88276032a26c), [`6b6fe3cbc`](https://github.com/dotansimha/graphql-code-generator/commit/6b6fe3cbcc7de748754703adce0f62f3e070a098), [`a3309e63e`](https://github.com/dotansimha/graphql-code-generator/commit/a3309e63efed880e6f74ce6fcbf82dd3d7857a15)]:
  - @graphql-codegen/plugin-helpers@4.1.0
  - @graphql-codegen/visitor-plugin-common@3.0.1

## 3.0.0

### Major Changes

- [#8885](https://github.com/dotansimha/graphql-code-generator/pull/8885) [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d) Thanks [@n1ru4l](https://github.com/n1ru4l)! - drop Node.js 12 support

### Patch Changes

- Updated dependencies [[`fc79b65d4`](https://github.com/dotansimha/graphql-code-generator/commit/fc79b65d4914fd25ae6bd5d58ebc7ded573a08a5), [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d)]:
  - @graphql-codegen/visitor-plugin-common@3.0.0
  - @graphql-codegen/plugin-helpers@4.0.0

## 2.3.13

### Patch Changes

- Updated dependencies [[`a98198524`](https://github.com/dotansimha/graphql-code-generator/commit/a9819852443884b43de7c15040ccffc205f9177a)]:
  - @graphql-codegen/visitor-plugin-common@2.13.8

## 2.3.12

### Patch Changes

- Updated dependencies [[`eb454d06c`](https://github.com/dotansimha/graphql-code-generator/commit/eb454d06c977f11f7d4a7b0b07eb80f8fd590560)]:
  - @graphql-codegen/visitor-plugin-common@2.13.7

## 2.3.11

### Patch Changes

- Updated dependencies [[`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7), [`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7), [`6c6b6f2df`](https://github.com/dotansimha/graphql-code-generator/commit/6c6b6f2df88a3a37b437a25320dab5590f033316)]:
  - @graphql-codegen/plugin-helpers@3.1.2
  - @graphql-codegen/visitor-plugin-common@2.13.6

## 2.3.10

### Patch Changes

- [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a) Thanks [@saihaj](https://github.com/saihaj)! - fix the version of `@graphql-codegen/plugin-helpers@3.1.1`

- Updated dependencies [[`307a5d350`](https://github.com/dotansimha/graphql-code-generator/commit/307a5d350643dd065d228b04ef3b4bd70cac0e81), [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a)]:
  - @graphql-codegen/plugin-helpers@3.1.1
  - @graphql-codegen/visitor-plugin-common@2.13.5

## 2.3.9

### Patch Changes

- [#8686](https://github.com/dotansimha/graphql-code-generator/pull/8686) [`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`change-case-all@1.0.15` ↗︎](https://www.npmjs.com/package/change-case-all/v/1.0.15) (from `1.0.14`, in `dependencies`)
- Updated dependencies [[`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`f79a00e8a`](https://github.com/dotansimha/graphql-code-generator/commit/f79a00e8ae073eab426ca08795c924e716123482), [`c802a0c0b`](https://github.com/dotansimha/graphql-code-generator/commit/c802a0c0b775cfabc5ace3e7fb6655540c6c4d84)]:
  - @graphql-codegen/plugin-helpers@3.0.0
  - @graphql-codegen/visitor-plugin-common@2.13.4

## 2.3.8

### Patch Changes

- Updated dependencies [[`62f655452`](https://github.com/dotansimha/graphql-code-generator/commit/62f6554520955dd675e11c920f35ef9bf0aaeffe)]:
  - @graphql-codegen/visitor-plugin-common@2.13.3

## 2.3.7

### Patch Changes

- Updated dependencies [[`ef4c2c9c2`](https://github.com/dotansimha/graphql-code-generator/commit/ef4c2c9c233c68830f10eb4c167c7cceead27122)]:
  - @graphql-codegen/visitor-plugin-common@2.13.2

## 2.3.6

### Patch Changes

- Updated dependencies [[`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127)]:
  - @graphql-codegen/visitor-plugin-common@2.13.1
  - @graphql-codegen/plugin-helpers@2.7.2

## 2.3.5

### Patch Changes

- Updated dependencies [[`a46b8d99c`](https://github.com/dotansimha/graphql-code-generator/commit/a46b8d99c797283d773ec14163c62be9c84d4c2b)]:
  - @graphql-codegen/visitor-plugin-common@2.13.0

## 2.3.4

### Patch Changes

- Updated dependencies [[`1bd7f771c`](https://github.com/dotansimha/graphql-code-generator/commit/1bd7f771ccb949a5a37395c7c57cb41c19340714)]:
  - @graphql-codegen/visitor-plugin-common@2.12.2

## 2.3.3

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189) [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with `moduleResolution` `node16` or `nodenext`

- Updated dependencies [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f), [`47d0a57e2`](https://github.com/dotansimha/graphql-code-generator/commit/47d0a57e27dd0d2334670bfc6c81c45e00ff4e74)]:
  - @graphql-codegen/visitor-plugin-common@2.12.1
  - @graphql-codegen/plugin-helpers@2.6.2

## 2.3.2

### Patch Changes

- Updated dependencies [2cbcbb371]
  - @graphql-codegen/visitor-plugin-common@2.12.0
  - @graphql-codegen/plugin-helpers@2.6.0

## 2.3.1

### Patch Changes

- Updated dependencies [525ad580b]
  - @graphql-codegen/visitor-plugin-common@2.11.1

## 2.3.0

### Minor Changes

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- Updated dependencies [68bb30e19]
- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/visitor-plugin-common@2.11.0
  - @graphql-codegen/plugin-helpers@2.5.0

## 2.2.14

### Patch Changes

- Updated dependencies [aa1e6eafd]
- Updated dependencies [a42fcbfe4]
- Updated dependencies [8b10f22be]
  - @graphql-codegen/visitor-plugin-common@2.10.0

## 2.2.13

### Patch Changes

- Updated dependencies [d16bebacb]
  - @graphql-codegen/visitor-plugin-common@2.9.1

## 2.2.12

### Patch Changes

- Updated dependencies [c3d7b7226]
  - @graphql-codegen/visitor-plugin-common@2.9.0

## 2.2.11

### Patch Changes

- Updated dependencies [f1fb77bd4]
  - @graphql-codegen/visitor-plugin-common@2.8.0

## 2.2.10

### Patch Changes

- Updated dependencies [9a5f31cb6]
  - @graphql-codegen/visitor-plugin-common@2.7.6

## 2.2.9

### Patch Changes

- Updated dependencies [2966686e9]
  - @graphql-codegen/visitor-plugin-common@2.7.5

## 2.2.8

### Patch Changes

- Updated dependencies [337fd4f77]
  - @graphql-codegen/visitor-plugin-common@2.7.4

## 2.2.7

### Patch Changes

- Updated dependencies [54718c039]
  - @graphql-codegen/visitor-plugin-common@2.7.3

## 2.2.6

### Patch Changes

- Updated dependencies [11d05e361]
  - @graphql-codegen/visitor-plugin-common@2.7.2

## 2.2.5

### Patch Changes

- Updated dependencies [fd55e2039]
  - @graphql-codegen/visitor-plugin-common@2.7.1

## 2.2.4

### Patch Changes

- Updated dependencies [1479233df]
  - @graphql-codegen/visitor-plugin-common@2.7.0

## 2.2.3

### Patch Changes

- Updated dependencies [c8ef37ae0]
- Updated dependencies [754a33715]
- Updated dependencies [bef4376d5]
- Updated dependencies [be7cb3a82]
  - @graphql-codegen/visitor-plugin-common@2.6.0
  - @graphql-codegen/plugin-helpers@2.4.0

## 2.2.2

### Patch Changes

- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [6002feb3d]
  - @graphql-codegen/visitor-plugin-common@2.5.2
  - @graphql-codegen/plugin-helpers@2.3.2

## 2.2.1

### Patch Changes

- Updated dependencies [a9f1f1594]
- Updated dependencies [9ea6621ec]
  - @graphql-codegen/visitor-plugin-common@2.5.1

## 2.2.0

### Minor Changes

- 97ddb487a: feat: GraphQL v16 compatibility

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/visitor-plugin-common@2.5.0
  - @graphql-codegen/plugin-helpers@2.3.0

## 2.1.6

### Patch Changes

- Updated dependencies [ad02cb9b8]
  - @graphql-codegen/visitor-plugin-common@2.4.0

## 2.1.5

### Patch Changes

- Updated dependencies [b9e85adae]
- Updated dependencies [7c60e5acc]
- Updated dependencies [3c2c847be]
  - @graphql-codegen/visitor-plugin-common@2.3.0
  - @graphql-codegen/plugin-helpers@2.2.0

## 2.1.4

### Patch Changes

- Updated dependencies [0b090e31a]
  - @graphql-codegen/visitor-plugin-common@2.2.1

## 2.1.3

### Patch Changes

- Updated dependencies [d6c2d4c09]
- Updated dependencies [feeae1c66]
- Updated dependencies [5086791ac]
  - @graphql-codegen/visitor-plugin-common@2.2.0

## 2.1.2

### Patch Changes

- Updated dependencies [6470e6cc9]
- Updated dependencies [263570e50]
- Updated dependencies [35199dedf]
  - @graphql-codegen/visitor-plugin-common@2.1.2
  - @graphql-codegen/plugin-helpers@2.1.1

## 2.1.1

### Patch Changes

- Updated dependencies [aabeff181]
  - @graphql-codegen/visitor-plugin-common@2.1.1

## 2.1.0

### Minor Changes

- 440172cfe: support ESM

### Patch Changes

- 440172cfe: export config types
- Updated dependencies [290170262]
- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/visitor-plugin-common@2.1.0
  - @graphql-codegen/plugin-helpers@2.1.0

## 2.0.0

### Major Changes

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

### Minor Changes

- bbdad95fd: Generation of `__typename` for SelectionSet by `addTypenameToSelectionSets` parameter

### Patch Changes

- Updated dependencies [d80efdec4]
- Updated dependencies [d80efdec4]
- Updated dependencies [b0cb13df4]
  - @graphql-codegen/visitor-plugin-common@2.0.0
  - @graphql-codegen/plugin-helpers@2.0.0

## 1.18.10

### Patch Changes

- Updated dependencies [df19a4ed]
- Updated dependencies [470336a1]
- Updated dependencies [9005cc17]
  - @graphql-codegen/visitor-plugin-common@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.8

## 1.18.9

### Patch Changes

- Updated dependencies [6762aff5]
  - @graphql-codegen/visitor-plugin-common@1.21.3

## 1.18.8

### Patch Changes

- Updated dependencies [6aaecf1c]
  - @graphql-codegen/visitor-plugin-common@1.21.2

## 1.18.7

### Patch Changes

- cf1e5abc: Introduce new feature for removing duplicated fragments
- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1

## 1.18.6

### Patch Changes

- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7

## 1.18.5

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.18.4

### Patch Changes

- 23862e7e: fix(naming-convention): revert and pin change-case-all dependency for workaround #3256
- Updated dependencies [23862e7e]
  - @graphql-codegen/visitor-plugin-common@1.19.1
  - @graphql-codegen/plugin-helpers@1.18.4

## 1.18.3

### Patch Changes

- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.18.2

### Patch Changes

- 99533389: Enable flattening typed document nodes
- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 1.18.1

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.18.0

### Minor Changes

- bd3bd296: Improve DocumentNode optimizations, to reduce bundle size when consumed as pre-compiled

### Patch Changes

- Updated dependencies [99819bf1]
- Updated dependencies [c3b59e81]
  - @graphql-codegen/visitor-plugin-common@1.17.19

## 1.17.10

### Patch Changes

- 3e3941b9: Avoid printing imports when there are no operations
- Updated dependencies [612e5e52]
- Updated dependencies [9f2a4e2f]
- Updated dependencies [0f35e775]
- Updated dependencies [eaf45d1f]
  - @graphql-codegen/visitor-plugin-common@1.17.17
  - @graphql-codegen/plugin-helpers@1.18.1

## 1.17.9

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8

## 1.17.8

### Patch Changes

- 4266a15f: Allow this plugin to work with `documentMode: graphqlTag` correctly.

  Added validation for preventing `documentMode: string` because it's not supported in this plugin.

- Updated dependencies [4266a15f]
  - @graphql-codegen/visitor-plugin-common@1.17.12
