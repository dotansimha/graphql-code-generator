---
id: index
title: Available Plugins
---

The general purpose of GraphQL Code Generator is to parse GraphQL syntax, transform it into an AST and then output it into desired formats which can vary. Since there can be potentially infinite amount of formats, we can't predict them all. However, some formats are more likely to be used, thus, we've prepared pre-defined code generation plugins which are built for these formats.

## Available Plugins

Below is table with lists all available plugins which can be installed via NPM, along with a short description. If you're looking for anything specific, we might already have the solution:

| Format                                             | Purpose                                                                                                        | Package Name & Docs                                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `typescript-common`                                | Generate enums, scalars and input types - those are usually relevant for both client side and server side code | [`graphql-codegen-typescript-common`](./plugins/typescript-common.md)                               |
| `typescript-client`                                | Generate client specific TypeScript types (query, mutation, subscription, fragment)                            | [`graphql-codegen-typescript-client`](./plugins/typescript-client.md)                               |
| `typescript-server`                                | Generate server specific TypeScript types (types, directives, interfaces, unions)                              | [`graphql-codegen-typescript-server`](./plugins/typescript-server.md)                               |
| `typescript-resolvers`                             | Generate TypeScript signature for server-side resolvers                                                        | [`graphql-codegen-typescript-resolvers`](./plugins/typescript-resolvers.md)                         |
| `typescript-apollo-angular`                        | Generate TypeScript types, and Apollo-Angular Services                                                         | [`graphql-codegen-typescript-apollo-angular`](./plugins/typescript-apollo-angular.md)               |
| `typescript-react-apollo`                          | Generate TypeScript types, and React-Apollo Components                                                         | [`graphql-codegen-typescript-react-apollo`](./plugins/typescript-react-apollo.md)                   |
| `typescript-mongodb`                               | Generate Generate server-side TypeScript types, with MongoDB models                                            | [`graphql-codegen-typescript-mongodb`](./plugins/typescript-mongodb.md)                             |
| `graphql-codegen-typescript-graphql-files-modules` | Generate `declare module` for `.graphql` files                                                                 | [`graphql-codegen-typescript-graphql-files-modules`](./plugins/typescript-graphql-files-modules.md) |
| `add`                                              | Add any string that you wish to the output file                                                                | [`graphql-codegen-add`](./plugins/add.md)                                                           |
| `time`                                             | Add the generation time to the output file                                                                     | [`graphql-codegen-time`](./plugins/time.md)                                                         |

In addition, you can build your own code generating plugins based on your specific needs. For more information, check [this doc page](../custom-codegen/index).

## How to use Plugins

To use a plugin, install it's package from `npm`, then add it to your YML config file:

```yml
schema: my-schema.graphql
generates:
  output.ts:
    - plugin-name-here
```

## Configure Plugin

To pass configuration to plugin, do the following:

```yml
schema: my-schema.graphql
generates:
  output.ts:
    - plugin-name-here:
        configKey: configValue
```

You can also pass the same configuration value for multiple plugins:

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

You can find a the supported configuration for each plugins in it's page / `README` file.
