---
id: apollo-link-state
title: apollo-link-state
---

If you are using [apollo-client](https://www.apollographql.com/docs/react/) and [apollo-link-state](https://www.apollographql.com/docs/link/links/state.html) to manage your app state with GraphQL, you're probably using a client-side only GraphQL schema and client-side directives such as `@client`.

Thses types and directives are not part of your remote GraphQL schema.

For example:

```graphql
query myQuery {
  todos {
    id
    title
    checked
    selected @client
  }
}
```

If you wish to get better integarion and fully type-safe types for your client side schema as well, you can create a `.graphql` file for your local schema, for example:

```
type Todo {
  selected: Boolean!
}
```

And then, you can merge this part of the schema with your remote schema, by specifying it as part of your `schema` field:

```yml
schema:
  - http://my-remote-schema/graphql
  - my-client-schema.graphql
```

This way, the GraphQL Code Generator will generate a complete typings that matches both your client fields and server fields.
