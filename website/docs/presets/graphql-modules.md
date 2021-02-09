---
id: graphql-modules
title: graphql-modules
---

The `@graphql-codegen/graphql-modules-preset` generates `.ts` file with TypeScript types, per each [GraphQL-Modules](http://graphql-modules.com/) module definition.

The generates files will be generated based on each module definition, and based on the GraphQL schema defined in that specific module, allowing you to write type-safe resolvers, while keeping modules types boundaries.

:::caution Usage Requirements

This preset generates code for `graphql-modules` @ `v1`. Previous versions are not supported.

:::

## Configuration

{@import ../generated-config/graphql-modules-preset.md}

## Usage Example

Here's a short example for generating types and resolvers for 2 modules:

```yaml
schema: './src/modules/**/typedefs/*.graphql'
generates:
  ./server/src/modules/:
    preset: graphql-modules
    presetConfig:
      baseTypesPath: ../generated-types/graphql.ts # Where to create the complete schema types
      filename: generated-types/module-types.ts # Where to create each module types
    plugins:
      - add:
          content: '/* eslint-disable */'
      - typescript
      - typescript-resolvers
```

This will generate a file called `module-types.ts` under each module you have.

To use the generates resolvers, you can use `Resolvers` signature and apply it to your resolvers object within the module:

```ts
// src/modules/user/resolvers.ts
import { MyModule } from './generated-types/module-types';

export const resolvers: MyModule.Resolvers = {
  // Here you can implement only the types and fields defined in your module!
};
```

> You can find [an example project here](https://github.com/dotansimha/graphql-code-generator/tree/master/dev-test/modules).
