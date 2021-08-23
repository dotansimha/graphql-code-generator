# @graphql-codegen/gql-tag-operations

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
