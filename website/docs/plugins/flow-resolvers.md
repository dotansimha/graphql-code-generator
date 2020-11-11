---
id: flow-resolvers
title: Flow Resolvers
---

{@import ../generated-config/flow-resolvers.md}


## Usage Example

:::info Quick Start with `flow-resolvers`
You can find [a blog post we wrote about using and customizing this plugin here](https://the-guild.dev/blog/better-type-safety-for-resolvers-with-graphql-codegen) , it refers to `typescript-resolvers` but everything there is relevant to `flow-resolvers` as well.
:::

## Enum Resolvers

[Apollo-Server](https://www.apollographql.com/docs/apollo-server/) and schemas built with [`graphql-tools`](https://www.graphql-tools.com/) supports creating resolvers for GraphQL `enum`s. 

This is helpful because you can have internal values that are different from the public enum values, and you can use the internal values in your resolvers. 

Codegen allows you to specify either `mappers` or `enumValues` to map enums in your resolvers, and if you are using it for enums, you'll get a resolver signature for the enum resolvers as well.

#### Usage Example

With the following schema:

```graphql
type Query {
  favoriteColor: Color!
}

type Color {
  RED,
  BLUE
}
```

```yaml
schema: schema.graphql
generates:
  ./resolvers-types.js:
    config:
      enumValues:
        Colors: ./enums#ColorsCode
    plugins:
      - flow
      - flow-resolvers
```

```ts
// in your enums.js
export enum ColorsCode {
  MY_RED = '#FF0000',
  MY_BLUE = '#0000FF',
}

// in your resolvers.js
import type { Resolvers } from './resolvers-types';
import { ColorsCode } from './enums';

const resolvers: Resolvers = {
  Colors: {
    RED: ColorsCode.MY_RED,
    BLUE: ColorsCode.MY_BLUE,
  },
  Query: {
    favoriteColor: () => ColorsCode.MY_RED, // Now you cn return this, and it will be mapped to your actual GraphQL enum
  }
}
```

You can also define the same with explicit enum values:

```yaml
schema: schema.graphql
generates:
  ./resolvers-types.js:
    config:
      enumValues:
        Colors: 
          RED: '#FF0000'
          BLUE: '#0000FF'
    plugins:
      - flow
      - flow-resolvers
```

Or, with `mappers`:

```yaml
schema: schema.graphql
generates:
  ./resolvers-types.js:
    config:
      mappers:
        Colors: ./enums#ColorsCode
    plugins:
      - flow
      - flow-resolvers
```
