# @graphql-codegen/gql-tag-operations

## 1.4.1

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189) [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with `moduleResolution` `node16` or `nodenext`

- Updated dependencies [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f), [`47d0a57e2`](https://github.com/dotansimha/graphql-code-generator/commit/47d0a57e27dd0d2334670bfc6c81c45e00ff4e74)]:
  - @graphql-codegen/visitor-plugin-common@2.12.1
  - @graphql-codegen/plugin-helpers@2.6.2

## 1.4.0

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

### Patch Changes

- Updated dependencies [2cbcbb371]
  - @graphql-codegen/visitor-plugin-common@2.12.0
  - @graphql-codegen/plugin-helpers@2.6.0

## 1.3.1

### Patch Changes

- 525ad580b: Revert breaking change for Next.js applications that are incapable of resolving an import with a `.js` extension.
- Updated dependencies [525ad580b]
  - @graphql-codegen/visitor-plugin-common@2.11.1

## 1.3.0

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

## 1.2.17

### Patch Changes

- Updated dependencies [aa1e6eafd]
- Updated dependencies [a42fcbfe4]
- Updated dependencies [8b10f22be]
  - @graphql-codegen/visitor-plugin-common@2.10.0

## 1.2.16

### Patch Changes

- Updated dependencies [d16bebacb]
  - @graphql-codegen/visitor-plugin-common@2.9.1

## 1.2.15

### Patch Changes

- Updated dependencies [c3d7b7226]
  - @graphql-codegen/visitor-plugin-common@2.9.0

## 1.2.14

### Patch Changes

- Updated dependencies [f1fb77bd4]
  - @graphql-codegen/visitor-plugin-common@2.8.0

## 1.2.13

### Patch Changes

- Updated dependencies [9a5f31cb6]
  - @graphql-codegen/visitor-plugin-common@2.7.6

## 1.2.12

### Patch Changes

- Updated dependencies [2966686e9]
  - @graphql-codegen/visitor-plugin-common@2.7.5

## 1.2.11

### Patch Changes

- Updated dependencies [337fd4f77]
  - @graphql-codegen/visitor-plugin-common@2.7.4

## 1.2.10

### Patch Changes

- Updated dependencies [54718c039]
  - @graphql-codegen/visitor-plugin-common@2.7.3

## 1.2.9

### Patch Changes

- Updated dependencies [11d05e361]
  - @graphql-codegen/visitor-plugin-common@2.7.2

## 1.2.8

### Patch Changes

- Updated dependencies [fd55e2039]
  - @graphql-codegen/visitor-plugin-common@2.7.1

## 1.2.7

### Patch Changes

- Updated dependencies [1479233df]
  - @graphql-codegen/visitor-plugin-common@2.7.0

## 1.2.6

### Patch Changes

- Updated dependencies [c8ef37ae0]
- Updated dependencies [754a33715]
- Updated dependencies [bef4376d5]
- Updated dependencies [be7cb3a82]
  - @graphql-codegen/visitor-plugin-common@2.6.0
  - @graphql-codegen/plugin-helpers@2.4.0

## 1.2.5

### Patch Changes

- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [6002feb3d]
  - @graphql-codegen/visitor-plugin-common@2.5.2
  - @graphql-codegen/plugin-helpers@2.3.2

## 1.2.4

### Patch Changes

- Updated dependencies [a9f1f1594]
- Updated dependencies [9ea6621ec]
  - @graphql-codegen/visitor-plugin-common@2.5.1

## 1.2.3

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/visitor-plugin-common@2.5.0
  - @graphql-codegen/plugin-helpers@2.3.0

## 1.2.2

### Patch Changes

- Updated dependencies [ad02cb9b8]
  - @graphql-codegen/visitor-plugin-common@2.4.0

## 1.2.1

### Patch Changes

- Updated dependencies [b9e85adae]
- Updated dependencies [7c60e5acc]
- Updated dependencies [3c2c847be]
  - @graphql-codegen/visitor-plugin-common@2.3.0
  - @graphql-codegen/plugin-helpers@2.2.0

## 1.2.0

### Minor Changes

- 1e9a7e162: feat: support module augumentation for extending the types of gql functions from existing packages via the `augmentedModuleName` config option.

## 1.1.5

### Patch Changes

- 06dfd3958: fix: follow "useTypeImports" configuration
- 5394f19bb: prevent duplicate operations

## 1.1.4

### Patch Changes

- Updated dependencies [0b090e31a]
  - @graphql-codegen/visitor-plugin-common@2.2.1

## 1.1.3

### Patch Changes

- Updated dependencies [d6c2d4c09]
- Updated dependencies [feeae1c66]
- Updated dependencies [5086791ac]
  - @graphql-codegen/visitor-plugin-common@2.2.0

## 1.1.2

### Patch Changes

- Updated dependencies [6470e6cc9]
- Updated dependencies [263570e50]
- Updated dependencies [35199dedf]
  - @graphql-codegen/visitor-plugin-common@2.1.2
  - @graphql-codegen/plugin-helpers@2.1.1

## 1.1.1

### Patch Changes

- Updated dependencies [aabeff181]
  - @graphql-codegen/visitor-plugin-common@2.1.1

## 1.1.0

### Minor Changes

- 0c0c8a92b: export new utility type `DocumentType`, for accessing the document node type.

  ```tsx
  import { gql, DocumentType } from '../gql';

  const TweetFragment = gql(/* GraphQL */ `
    fragment TweetFragment on Tweet {
      id
      body
    }
  `);

  const Tweet = (props: { tweet: DocumentType<typeof TweetFragment> }) => {
    return <div data-id={props.id}>{props.body}</div>;
  };
  ```

- 440172cfe: support ESM

### Patch Changes

- 24185985a: bump graphql-tools package versions
- Updated dependencies [290170262]
- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/visitor-plugin-common@2.1.0
  - @graphql-codegen/plugin-helpers@2.1.0

## 1.0.0

### Major Changes

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

### Minor Changes

- b0cb13df4: new plugin/preset gql-tag-operations

### Patch Changes

- Updated dependencies [d80efdec4]
- Updated dependencies [d80efdec4]
- Updated dependencies [b0cb13df4]
  - @graphql-codegen/visitor-plugin-common@2.0.0
  - @graphql-codegen/plugin-helpers@2.0.0
