---
id: index
title: Available Plugins
---

The general purpose of GraphQL Code Generator is to parse GraphQL syntax, transform it into an AST and then output it into desired formats which can vary. Since there can potentially be an infinite number of formats, we can't predict them all. However, some formats are more likely to be used, thus, we've prepared pre-defined code generation plugins which are built for these formats.

## Available Plugins

Below is a table that lists all available plugins which can be installed via NPM, along with a short description. If you're looking for anything specific, we might already have the solution:

| Format                             | Purpose                                                                                              | Package Name & Docs                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `typescript`                       | Generate types for TypeScript - those are usually relevant for both client side and server side code | [`@graphql-codegen/typescript`](./typescript.md)                                             |
| `typescript-operations`            | Generate client specific TypeScript types (query, mutation, subscription, fragment)                  | [`@graphql-codegen/typescript-operations`](./typescript-operations.md)                       |
| `typescript-resolvers`             | Generate TypeScript signature for server-side resolvers                                              | [`@graphql-codegen/typescript-resolvers`](./typescript-resolvers.md)                         |
| `typescript-apollo-angular`        | Generate TypeScript types, and Apollo-Angular Services                                               | [`@graphql-codegen/typescript-apollo-angular`](./typescript-apollo-angular.md)               |
| `typescript-react-apollo`          | Generate TypeScript types, and React-Apollo Components                                               | [`@graphql-codegen/typescript-react-apollo`](./typescript-react-apollo.md)                   |
| `typescript-mongodb`               | Generate Generate server-side TypeScript types, with MongoDB models                                  | [`@graphql-codegen/typescript-mongodb`](./typescript-mongodb.md)                             |
| `typescript-graphql-files-modules` | Generate `declare module` for `.graphql` files                                                       | [`@graphql-codegen/typescript-graphql-files-modules`](./typescript-graphql-files-modules.md) |
| `typescript-document-nodes`        | Generate TypeScript source files files that use `graphql-tag`                                        | [`@graphql-codegen/typescript-document-nodes`](./typescript-document-nodes.md)               |
| `add`                              | Add any string that you wish to the output file                                                      | [`@graphql-codegen/add`](./add.md)                                                           |
| `schema-ast`                       | Prints the merged schemas as AST                                                                     | [`@graphql-codegen/schema-ast`](./schema-ast.md)                                             |
| `fragment-matcher`                 | Generates an introspection result with only Unions and Interfaces                                    | [`@graphql-codegen/fragment-matcher`](./fragment-matcher.md)                                 |
| `time`                             | Add the generation time to the output file                                                           | [`@graphql-codegen/time`](./time.md)                                                         |
| `flow`                             | Generate types for Flow type based on your GraphQL schema                                            | [`@graphql-codegen/flow`](./flow.md)                                                         |
| `flow-resolvers`                   | Generate resolvers signature for Flow                                                                | [`@graphql-codegen/flow-resolvers`](./flow-resolvers.md)                                     |
| `flow-operations`                  | Generate types for Flow type based on your GraphQL operations                                        | [`@graphql-codegen/flow-operations`](./flow-operations.md)                                   |
| `reason-client`                    | Generate ReasonML types based on your GraphQL schema for use in a client application                 | [`@graphql-codegen/reason-client`](./reason-client.md)                                       |

In addition, you can build your own code generating plugins based on your specific needs. For more information, check [this doc page](../custom-codegen/index).

## How to use Plugins

To use a plugin, install its package from `npm`, then add it to your YML config file:

```yml
schema: my-schema.graphql
generates:
  output.ts:
    - plugin-name-here
```

## Configure Plugins

To pass configuration to a plugin, do the following:

```yml
schema: my-schema.graphql
generates:
  output.ts:
    - plugin-name-here:
        configKey: configValue
```

You can also pass the same configuration value to multiple plugins:

```yml
schema: my-schema.graphql
generates:
  output.ts:
    config:
      configKey: configValue
    plugins:
      - plugin1-name-here
      - plugin2-name-here
```

You can find the supported configuration for each plugin in its page / `README` file.
