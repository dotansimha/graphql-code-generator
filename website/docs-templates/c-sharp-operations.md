---
id: c-sharp-operations
---

The `c-sharp-operations` plugin generates C# methods for the resolvers signature.

It works with [GraphQL.Client](https://nuget.org/packages/GraphQL.Client) library and methods can be invoked through the `GraphQLHttpClient`.

Example code:

```c#
using GraphQL.Client.Http;
using GraphQL.Client.Serializer.Newtonsoft;

  ...
  using var client = new GraphQLHttpClient("https://gqlserver", new NewtonsoftJsonSerializer());
  var response = await client.SendQueryAsync<Types.Query>(UsersGQL.Request());
```

{@operationsNote}

{@apiDocs}
