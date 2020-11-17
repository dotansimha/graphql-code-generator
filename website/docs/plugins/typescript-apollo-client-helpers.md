---
id: typescript-apollo-client-helpers
title: Apollo-Client Helpers
---

This plugin generates helpers for improving the integration of TypeScript and Apollo-Client, based on your schema.

> Note: this plugin generates code that intended for `apollo-client` @ `> v3` only.

This plugin generates fully-typed `keyFields` and Type-Policies for Apollo-Client.

> [You can read more about type-policies in Apollo Cache here](https://www.apollographql.com/docs/react/caching/cache-configuration/#typepolicy-fields)

### How to use?

Start by add this plugin to your configuration:

```yaml
schema: my-schema.graphql
generates:
  apollo-helpers.ts:
    plugins:
      - typescript-apollo-client-helpers
```

Then, use the generated TypeScript `type` as your signature for `typePolicies`:

```ts
import { TypedTypePolicies } from './apollo-helpers';

const typePolicies: TypedTypePolicies = {
  // Keys in this object will be validated against the typed on your schema
  Product: {
    keyFields: ['id'], // Values in this field will be validated against the available fields from the Product type
  },
  Person: {
    keyFields: ['name', 'email'],
  },
  Book: {
    // This entire definition is typed, based on available types and fields
    fields: {
      tags: {
        merge: false,
      },
    },
  },
};

const cache = new InMemoryCache({
  typePolicies,
});
```

{@import ../generated-config/typescript-apollo-client-helpers.md}
