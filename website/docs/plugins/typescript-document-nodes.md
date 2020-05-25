---
id: typescript-document-nodes
title: TypeScript document nodes
---

{@import ../generated-config/typescript-document-nodes.md}

## Usage

With [GitHub GraphQL API v4](https://developer.github.com/v4/) schema and
following GraphQL operation:

```graphql
query Viewer {
  viewer {
    login
    name
  }
}
```

It will generate following TypeScript code:

```ts
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

export const viewerQuery: DocumentNode = gql`
  query Viewer {
    viewer {
      login
      name
    }
  }
`;
```

