---
id: apollo-local-state
title: Apollo Local State
---

Suppose you are using [apollo-client](https://apollographql.com/docs/react/v2/data/local-state) >2.5 (or older, with [apollo-link-state](https://apollographql.com/docs/link/links/state.html)) to manage your app state with GraphQL. In that case, you're probably using a client-side only GraphQL schema and client-side directives such as `@client`.

The client-side only GraphQL schema and client-side directives are not part of your remote GraphQL schema.
This prevents them from being included in your existing GraphQL Code Generator configuration:

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

If you wish to get better integration and fully type-safe types for your client-side schema as well, you can create a `.graphql` file for your local schema, for example:

```gql
type Todo {
  selected: Boolean!
}
```

And then, you can merge this part of the schema with your remote schema by specifying it as part of your `schema` field:

```yml
schema:
  - http://my-remote-schema/graphql
  - my-client-schema.graphql
```

This way, the GraphQL Code Generator will generate complete typings that match both your client fields and server fields.

If you only plan to perform a query with Apollo's local state, simply extend the `Query` type and add the field (query field) you're trying to call in your local `schema`:

```graphql
extend type Query {
  todos: Todo
}
```
