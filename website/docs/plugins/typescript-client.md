---
id: typescript-client
title: TypeScript Client
---

{@import ../plugins/client-note.md}

{@import ../generated-config/typescript-client.md}

## Usage Example

For the given input:

```graphql
query Test($first: Int) {
  feed(first: $first) {
    id
    commentCount
    repository {
      full_name
      html_url
      owner {
        avatar_url
      }
    }
  }
}
```

We can use the generated code like this:

```ts
import { queryTest } from './your-generated-file.ts';

const feedResults = await queryTest({ first: 10 });
```
