---
id: typescript-resolvers
title: TypeScript Resolvers
---

{@import ../generated-config/typescript-resolvers.md}

## Usage Example

:::info Quick Start with `typescript-resolvers`
You can find [a blog post we wrote about using and customizing this plugin here](https://the-guild.dev/blog/better-type-safety-for-resolvers-with-graphql-codegen)
:::

Run `graphql-codegen` as usual, with this new plugin:

```yaml
schema: schema.json
generates:
  ./src/resolvers-types.ts:
    plugins:
      - typescript
      - typescript-resolvers
```

Import the types from the generated file and use in the resolver:

```typescript
import { Resolvers } from './resolvers-types';

export const resolvers: Resolvers = {
  Query: {
    myQuery: (root, args, context) => {},
  }
};
```

This will make the resolver fully typed and compatible with typescript compiler, including the handler's arguments and return value.

Generated resolvers can be passed directly into [graphql-tools](https://www.npmjs.com/package/graphql-tools) `makeExecutableSchema` function.

## Integration with Apollo-Server

By default `apollo-server` will not work with generated resolvers signature.

If you are using Apollo Server with TypeScript, note that you need to set `useIndexSignature: true` in your config, in order to add a compatible index signature ([more info](https://github.com/dotansimha/graphql-code-generator/issues/1133#issuecomment-456812621)).

```yml
generates:
  ./resolvers-types.ts:
    config:
      useIndexSignature: true
    plugins:
      - typescript
      - typescript-resolvers
```

If you wish to have an easy start, and have the ability to use resolvers chaining without models types, you can also add to your config `defaultMapper: Partial<{T}>`. This will allow you to return partial types in your resolvers.

## Use Your Model Types (`mappers`)

If you wish to use your custom model types, codegen allow you to use `mappers` feature to map GraphQL types to your custom model types. [You can find an article explaining how to use `mappers` here](https://the-guild.dev/blog/better-type-safety-for-resolvers-with-graphql-codegen).

Here's the basic example of using it:

```yaml
schema: schema.graphql
generates:
  ./resolvers-types.ts:
    config:
      contextType: models#MyContextType
      mappers:
        User: ./models#UserModel
        Profile: ./models#UserProfile
    plugins:
      - typescript
      - typescript-resolvers
```

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
  ./resolvers-types.ts:
    config:
      enumValues:
        Colors: ./enums#ColorsCode
    plugins:
      - typescript
      - typescript-resolvers
```

```ts
// in your enums.ts
export enum ColorsCode {
  MY_RED = '#FF0000',
  MY_BLUE = '#0000FF',
}

// in your resolvers.ts
import { Resolvers } from './resolvers-types';
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
  ./resolvers-types.ts:
    config:
      enumValues:
        Colors: 
          RED: '#FF0000'
          BLUE: '#0000FF'
    plugins:
      - typescript
      - typescript-resolvers
```

Or, with `mappers`:

```yaml
schema: schema.graphql
generates:
  ./resolvers-types.ts:
    config:
      mappers:
        Colors: ./enums#ColorsCode
    plugins:
      - typescript
      - typescript-resolvers
```
