# @graphql-codegen/typescript-react-query

## 4.0.1

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189) [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with `moduleResolution` `node16` or `nodenext`

- Updated dependencies [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f), [`47d0a57e2`](https://github.com/dotansimha/graphql-code-generator/commit/47d0a57e27dd0d2334670bfc6c81c45e00ff4e74)]:
  - @graphql-codegen/visitor-plugin-common@2.12.1
  - @graphql-codegen/plugin-helpers@2.6.2

## 4.0.0

### Major Changes

- 5c7592b4d: Introduces breaking changes to support `react-query@4.0.0`:

  - react query package is now `@tanstack/react-query` -> import changes
  - introduced a `legacyMode` flag (`false` by default)

  /!\ If you are using the 'react-query' package or `react-query < 4`, please set the `legacyMode` option to `true`. /!\

## 3.6.2

### Patch Changes

- Updated dependencies [2cbcbb371]
  - @graphql-codegen/visitor-plugin-common@2.12.0
  - @graphql-codegen/plugin-helpers@2.6.0

## 3.6.1

### Patch Changes

- Updated dependencies [525ad580b]
  - @graphql-codegen/visitor-plugin-common@2.11.1

## 3.6.0

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

## 3.5.15

### Patch Changes

- Updated dependencies [aa1e6eafd]
- Updated dependencies [a42fcbfe4]
- Updated dependencies [8b10f22be]
  - @graphql-codegen/visitor-plugin-common@2.10.0

## 3.5.14

### Patch Changes

- Updated dependencies [d16bebacb]
  - @graphql-codegen/visitor-plugin-common@2.9.1

## 3.5.13

### Patch Changes

- Updated dependencies [c3d7b7226]
  - @graphql-codegen/visitor-plugin-common@2.9.0

## 3.5.12

### Patch Changes

- Updated dependencies [f1fb77bd4]
  - @graphql-codegen/visitor-plugin-common@2.8.0

## 3.5.11

### Patch Changes

- Updated dependencies [9a5f31cb6]
  - @graphql-codegen/visitor-plugin-common@2.7.6

## 3.5.10

### Patch Changes

- Updated dependencies [2966686e9]
  - @graphql-codegen/visitor-plugin-common@2.7.5

## 3.5.9

### Patch Changes

- 5685e5f52: enable useTypeImports
- 5685e5f52: respect useTypeImports in react-query

## 3.5.8

### Patch Changes

- Updated dependencies [337fd4f77]
  - @graphql-codegen/visitor-plugin-common@2.7.4

## 3.5.7

### Patch Changes

- Updated dependencies [54718c039]
  - @graphql-codegen/visitor-plugin-common@2.7.3

## 3.5.6

### Patch Changes

- Updated dependencies [11d05e361]
  - @graphql-codegen/visitor-plugin-common@2.7.2

## 3.5.5

### Patch Changes

- Updated dependencies [fd55e2039]
  - @graphql-codegen/visitor-plugin-common@2.7.1

## 3.5.4

### Patch Changes

- Updated dependencies [1479233df]
  - @graphql-codegen/visitor-plugin-common@2.7.0

## 3.5.3

### Patch Changes

- e17a7b0c3: fix(plugins/react-query): remove useless `RequestInit` import for custom fetcher

## 3.5.2

### Patch Changes

- ec4a5fd70: fix(react-query): avoid unused `RequestInit` import when fetcher is not exposed

## 3.5.1

### Patch Changes

- Updated dependencies [c8ef37ae0]
- Updated dependencies [754a33715]
- Updated dependencies [bef4376d5]
- Updated dependencies [be7cb3a82]
  - @graphql-codegen/visitor-plugin-common@2.6.0
  - @graphql-codegen/plugin-helpers@2.4.0

## 3.5.0

### Minor Changes

- ad8ffa457: Add options to exposed custom fetcher.
  eg. This enables passing headers to fetcher for prefetchQuery & get more query possibilities (user authentication)

## 3.4.0

### Minor Changes

- 04d323727: fix: ensure mutationKey is an array

### Patch Changes

- 04d323727: fix: ensure mutationKey is an array

## 3.3.2

### Patch Changes

- fa517214c: Generate `getKey` function on generated infinite queries when both `exposeQueryKeys` and `addInfiniteQuery` settings are `true`.

## 3.3.1

### Patch Changes

- 758c220da: Fix the React-Query InfiniteQuery hook error

## 3.3.0

### Minor Changes

- fc92334d4: Gets rid of graphql-tag from peerdeps of typescript-react-query plugin

## 3.2.3

### Patch Changes

- 9b4629465: fix invalid generated TypeScript code due to the `exposeMutationKey` option adding an unnecessary bracket
- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [6002feb3d]
  - @graphql-codegen/visitor-plugin-common@2.5.2
  - @graphql-codegen/plugin-helpers@2.3.2

## 3.2.2

### Patch Changes

- 0d71a60d9: stringify fetchParams if an object was provided via YAML config

## 3.2.1

### Patch Changes

- Updated dependencies [a9f1f1594]
- Updated dependencies [9ea6621ec]
  - @graphql-codegen/visitor-plugin-common@2.5.1

## 3.2.0

### Minor Changes

- f7a320a2d: Updates react-query to include the useInfiniteQuery as a config option

## 3.1.1

### Patch Changes

- 6c898efe5: list all dependencies used by the package in the package.json

## 3.1.0

### Minor Changes

- 97ddb487a: feat: GraphQL v16 compatibility

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/visitor-plugin-common@2.5.0
  - @graphql-codegen/plugin-helpers@2.3.0

## 3.0.3

### Patch Changes

- Updated dependencies [ad02cb9b8]
  - @graphql-codegen/visitor-plugin-common@2.4.0

## 3.0.2

### Patch Changes

- Updated dependencies [b9e85adae]
- Updated dependencies [7c60e5acc]
- Updated dependencies [3c2c847be]
  - @graphql-codegen/visitor-plugin-common@2.3.0
  - @graphql-codegen/plugin-helpers@2.2.0

## 3.0.1

### Patch Changes

- 4695472ee: make sourceData param required when user does not provide endpoint in config
- Updated dependencies [0b090e31a]
  - @graphql-codegen/visitor-plugin-common@2.2.1

## 3.0.0

### Major Changes

- 545c47039: Change `fetchParams` configuration option from object to string.The string will be inserted 1:1 into the generated code. This is a breaking change!

  This allows more flexibility for customization. Here are some examples:

  **Use an imported object for configuration**

  ```yaml
  schema: MY_SCHEMA_PATH
  documents: './src/**/*.graphql'
  generates:
    ./generates.ts:
      plugins:
        - add:
            content: "import { endpointUrl, fetchParams } from './my-config';"
        - typescript
        - typescript-operations
        - typescript-react-query
      config:
        fetcher:
          endpoint: 'endpointUrl'
          fetchParams: 'fetchParams'
  ```

  **Use environment variables for configuration**

  ```yaml
  schema: MY_SCHEMA_PATH
  documents: './src/**/*.graphql'
  generates:
    ./generates.ts:
      plugins:
        - typescript
        - typescript-operations
        - typescript-react-query
      config:
        fetcher:
          endpoint: 'endpointUrl'
          # Multiline string
          fetchParams: >
            {
              headers: {
                apiKey: process.env.APIKEY,
                somethingElse: process.env.SOMETHING,
              },
            }
  ```

- 5dc59c86f: Queries without variables will no longer have an undefined entry in their query key

### Minor Changes

- 99af5063e: Allow passing `headers` to `graphql-request`.

### Patch Changes

- ec2cba5e0: [typescript-react-query] Pass dataSource as argument to fetcher

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

- b6525bc40: Make typescript-react-query respect the dedupeOperationSuffix option for hook names
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

- a5de375a7: Added new flag for `exposeFetcher` for exporting the fetcher

### Patch Changes

- Updated dependencies [d80efdec4]
- Updated dependencies [d80efdec4]
- Updated dependencies [b0cb13df4]
  - @graphql-codegen/visitor-plugin-common@2.0.0
  - @graphql-codegen/plugin-helpers@2.0.0

## 1.3.5

### Patch Changes

- Updated dependencies [df19a4ed]
- Updated dependencies [470336a1]
- Updated dependencies [9005cc17]
  - @graphql-codegen/visitor-plugin-common@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.8

## 1.3.4

### Patch Changes

- Updated dependencies [6762aff5]
  - @graphql-codegen/visitor-plugin-common@1.21.3

## 1.3.3

### Patch Changes

- Updated dependencies [6aaecf1c]
  - @graphql-codegen/visitor-plugin-common@1.21.2

## 1.3.2

### Patch Changes

- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1

## 1.3.1

### Patch Changes

- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7

## 1.3.0

### Minor Changes

- 5c119438: Added an option exposeDocument to expose a document from the hook

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.2.4

### Patch Changes

- 23862e7e: fix(naming-convention): revert and pin change-case-all dependency for workaround #3256
- Updated dependencies [23862e7e]
  - @graphql-codegen/visitor-plugin-common@1.19.1
  - @graphql-codegen/plugin-helpers@1.18.4

## 1.2.3

### Patch Changes

- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.2.2

### Patch Changes

- e69869aa: enhance(react-query): Don't generate fetcher without operations (#5601)

## 1.2.1

### Patch Changes

- 70628c87: Add support for useTypeImports when using fetcher: graphql-request

## 1.2.0

### Minor Changes

- ed0ae4c7: Allow fetcher to receive variables lazily so it can use react hooks

### Patch Changes

- Updated dependencies [5749cb8a]
- Updated dependencies [5a12fe58]
  - @graphql-codegen/visitor-plugin-common@1.18.3

## 1.1.0

### Minor Changes

- e6efeadc: Allow to override TError type at the level of the config
- 3c30fbd4: Exposed query keys for each generated qurey hook

### Patch Changes

- Updated dependencies [63be0f40]
- Updated dependencies [190482a1]
- Updated dependencies [4444348d]
- Updated dependencies [142b32b3]
- Updated dependencies [42213fa0]
  - @graphql-codegen/visitor-plugin-common@1.18.1

## 1.0.0

### Major Changes

- b51712c3: - Upgraded react-query to v3
  - Modified generated useQuery hooks to allow passing in of data type to be used with query data selectors
  - Reworked the mutations so that variables are passed in at mutate time and not at instantiation

### Patch Changes

- cda6ded0: Make sure mutation variables are always optional
- d98f5079: Respect typesPrefix for generated types.

  Previously, the prefix was incorrectly applied to runtime hook names.

- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 0.1.1

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/plugin-helpers@1.18.2

## 0.1.0

### Minor Changes

- c3b59e81: NEW PLUGIN!

### Patch Changes

- Updated dependencies [99819bf1]
- Updated dependencies [c3b59e81]
  - @graphql-codegen/visitor-plugin-common@1.17.19
