---
id: typescript-svelte-apollo
title: TypeScript Svelte Apollo
---

{@import ../plugins/client-note.md}

{@import ../generated-config/typescript-svelte-apollo.md}

## Queries

Using the generated query code.

### Basic query

For the given input:

```graphql
query Message {
  feed {
    id
  }
}
```

We can use the generated code by setting AppoloClient context:

```svelte
// file: src/modules/App.svelte
<script lang="ts">
  import { ApolloClient, InMemoryCache } from "@apollo/client";
  import { setClient } from "../graphql/generated";
  import User from "./User.svelte";

  setClient(new ApolloClient({
    uri: process.env.URL_GRAPHQL,
    cache: new InMemoryCache({ addTypename: true }),
    connectToDevTools: true,
  }));
</script>

<main>
  <h1>Svelte + GraphQL Codegen</h1>
  <User />
</main>
```

And using the queries in children components:

```svelte
// file: src/modules/User.svelte
<script lang="ts">
  import { QueryListUsers } from "../graphql/generated";
  const usersQuery = QueryListUsers({});
</script>

{#await usersQuery}
  <p>Loading users...</p>
{:then user}
  <pre>{JSON.stringify(user, null, 1)}</pre>
{:catch error}
  <p>{error}</p>
{/await}
```
