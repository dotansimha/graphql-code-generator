---
id: named-operations-object
title: Named Operations Object
---

This plugin generates an object containing a list of all your GraphQL operations and fragments. This is useful if you are using Apollo-Client and wish to have type validation when you are using `refetchQueries`.

All operations and fragments are being exported by their name (so unnamed operations are being ignored), in the following structure:

```ts
export const namedOperations = {
  Query: [...],   
  Mutation: [...],   
  Subscription: [...],   
  Fragment: [...],   
}
```

{@import ../generated-config/named-operations-object.md}

## How to use?

Include the plugin within your output (into an existing JS/TS file, or a new file), for example:

```yaml
schema: YOUR_SCHEMA
documents: YOUR_OPERATIONS
generates:
  ./types.ts:
    plugins:
      - typescript
      - typescript-operations
      - named-operations-object
```

Now, you should be able to import `namedOperations` from that file, and use the names within your code. For example, with Apollo Client, you can do:

```ts
client
  .mutate(
    { ... },
    // No more typos, and you get auto-completion and build time validation
    { refetchQueries: [namedOperations.Query.myQuery] }
  );
```
