# @graphql-codegen/gql-tag-operations-preset

## 1.5.2

### Patch Changes

- bc4b7eb24: Bumping to release for https://github.com/dotansimha/graphql-code-generator/issues/8067

## 1.5.1

### Patch Changes

- 525ad580b: Revert breaking change for Next.js applications that are incapable of resolving an import with a `.js` extension.
- Updated dependencies [525ad580b]
  - @graphql-codegen/visitor-plugin-common@2.11.1
  - @graphql-codegen/gql-tag-operations@1.3.1
  - @graphql-codegen/typescript-operations@2.5.1
  - @graphql-codegen/typed-document-node@2.3.1
  - @graphql-codegen/typescript@2.7.1

## 1.5.0

### Minor Changes

- 68bb30e19: Attach `.js` extension to relative file imports for compliance with ESM module resolution. Since in CommonJS the `.js` extension is optional, this is not a breaking change.

  If you have path configuration within your configuration, consider attaching `.js` if you are migrating to ESM.

  ```yml
  mappers:
    MyOtherType: './my-file.js#MyCustomOtherType',
  ```

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- Updated dependencies [68bb30e19]
- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/visitor-plugin-common@2.11.0
  - @graphql-codegen/add@3.2.0
  - @graphql-codegen/gql-tag-operations@1.3.0
  - @graphql-codegen/typescript-operations@2.5.0
  - @graphql-codegen/typed-document-node@2.3.0
  - @graphql-codegen/typescript@2.7.0
  - @graphql-codegen/plugin-helpers@2.5.0

## 1.4.0

### Minor Changes

- 9d0840951: Allow `useFragment` to take arrays and nullable values as arguments

### Patch Changes

- Updated dependencies [9312920a4]
- Updated dependencies [2966686e9]
  - @graphql-codegen/typescript-operations@2.3.6
  - @graphql-codegen/visitor-plugin-common@2.7.5
  - @graphql-codegen/gql-tag-operations@1.2.12
  - @graphql-codegen/typed-document-node@2.2.9
  - @graphql-codegen/typescript@2.4.9

## 1.3.0

### Minor Changes

- 1479233df: The plugin now generates an `gql.ts` file for the `gql` function, whose contents are re-exported from the `index.ts` file. In module augmentation mode the `index.ts` file is omitted and only a `gql.d.ts` file is generated.

  Support for fragment masking via the new `fragmentMasking` configuration option. [Check out the Fragment Masking Documentation](https://graphql-code-generator.com/plugins/gql-tag-operations-preset#fragment-masking).

### Patch Changes

- Updated dependencies [1479233df]
  - @graphql-codegen/visitor-plugin-common@2.7.0
  - @graphql-codegen/gql-tag-operations@1.2.7
  - @graphql-codegen/typescript-operations@2.3.1
  - @graphql-codegen/typed-document-node@2.2.4
  - @graphql-codegen/typescript@2.4.4

## 1.2.3

### Patch Changes

- 015d34451: fix: gql-tag-operations generates invalid types on Windows #7362

## 1.2.2

### Patch Changes

- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [8643b3bf3]
- Updated dependencies [6002feb3d]
  - @graphql-codegen/add@3.1.1
  - @graphql-codegen/visitor-plugin-common@2.5.2
  - @graphql-codegen/gql-tag-operations@1.2.5
  - @graphql-codegen/typescript-operations@2.2.2
  - @graphql-codegen/typed-document-node@2.2.2
  - @graphql-codegen/typescript@2.4.2
  - @graphql-codegen/plugin-helpers@2.3.2

## 1.2.1

### Patch Changes

- 6c898efe5: list all dependencies used by the package in the package.json
- Updated dependencies [6c898efe5]
  - @graphql-codegen/typescript@2.3.1

## 1.2.0

### Minor Changes

- 1e9a7e162: feat: support module augumentation for extending the types of gql functions from existing packages via the `augmentedModuleName` config option.

### Patch Changes

- Updated dependencies [1e9a7e162]
  - @graphql-codegen/gql-tag-operations@1.2.0

## 1.1.7

### Patch Changes

- Updated dependencies [5c37b9d11]
  - @graphql-codegen/typescript-operations@2.1.6

## 1.1.6

### Patch Changes

- 06dfd3958: fix: follow "useTypeImports" configuration
- 5394f19bb: prevent duplicate operations
- Updated dependencies [06dfd3958]
- Updated dependencies [25cd11d01]
- Updated dependencies [5394f19bb]
  - @graphql-codegen/gql-tag-operations@1.1.5
  - @graphql-codegen/typescript-operations@2.1.5

## 1.1.5

### Patch Changes

- @graphql-codegen/gql-tag-operations@1.1.4
- @graphql-codegen/typescript-operations@2.1.4
- @graphql-codegen/typed-document-node@2.1.4
- @graphql-codegen/typescript@2.2.2

## 1.1.4

### Patch Changes

- Updated dependencies [cfa0a8f80]
  - @graphql-codegen/typescript@2.2.1

## 1.1.3

### Patch Changes

- Updated dependencies [d6c2d4c09]
- Updated dependencies [8261e4161]
  - @graphql-codegen/typescript@2.2.0
  - @graphql-codegen/gql-tag-operations@1.1.3
  - @graphql-codegen/typescript-operations@2.1.3
  - @graphql-codegen/typed-document-node@2.1.3

## 1.1.2

### Patch Changes

- @graphql-codegen/gql-tag-operations@1.1.2
- @graphql-codegen/typescript-operations@2.1.2
- @graphql-codegen/typed-document-node@2.1.2
- @graphql-codegen/typescript@2.1.2

## 1.1.1

### Patch Changes

- @graphql-codegen/gql-tag-operations@1.1.1
- @graphql-codegen/typescript-operations@2.1.1
- @graphql-codegen/typed-document-node@2.1.1
- @graphql-codegen/typescript@2.1.1

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

- 290170262: ensure the generated identifier for referencing a document from the documents map is correct
- Updated dependencies [0c0c8a92b]
- Updated dependencies [24185985a]
- Updated dependencies [440172cfe]
- Updated dependencies [440172cfe]
  - @graphql-codegen/gql-tag-operations@1.1.0
  - @graphql-codegen/typed-document-node@2.1.0
  - @graphql-codegen/add@3.1.0
  - @graphql-codegen/typescript-operations@2.1.0
  - @graphql-codegen/typescript@2.1.0

## 1.0.1

### Patch Changes

- Updated dependencies [e8c8e9c06]
  - @graphql-codegen/typescript-operations@2.0.1

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
- Updated dependencies [b0cb13df4]
- Updated dependencies [bbdad95fd]
  - @graphql-codegen/typescript-operations@2.0.0
  - @graphql-codegen/gql-tag-operations@1.0.0
  - @graphql-codegen/typed-document-node@2.0.0
  - @graphql-codegen/typescript@2.0.0
  - @graphql-codegen/add@3.0.0
