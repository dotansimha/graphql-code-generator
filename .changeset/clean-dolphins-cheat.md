---
'@graphql-codegen/gql-tag-operations': minor
'@graphql-codegen/gql-tag-operations-preset': minor
---

export new utility type `DocumentType`, for accessing the document node type.

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
