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

If you wish to have an easy start, and have the ability to use resolvers chaining without models types, you can also add to your config `defaultMapper: Partial<{T}>`. This will allow you to return partial typse in your resolvers.
