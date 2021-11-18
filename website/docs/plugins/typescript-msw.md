---
id: typescript-msw
title: TypeScript MSW
---

{@import ../plugins/client-note.md}

> Make sure you have `typescript` plugin and `typescript-operations` as well in your configuration:

{@import ../generated-config/typescript-msw.md}

### Usage

Input:

```graphql
query GetUser($id: ID!) {
  getUser(id: $id) {
    name
    id
  }
}
```

Usage:

```ts
import { mockGetUserQuery } from './generated';

const worker = setupWorker(
  mockGetUserQuery((req, res, ctx) => {
    const { id } = req.variables;

    return res(
      ctx.data({
        getUser: { name: 'John Doe', id: id },
      })
    );
  })
);

worker.start();
```

The generated functions are named `mock<OperationName><OperationType>[LinkName]`. E.g., `mockGetUserQuery`, and `mockAdminMutationStripe`.
