---
id: graphql-modules
---

The `@graphql-codegen/graphql-modules-preset` generates `.ts` file with TypeScript types, per each directory that contains GraphQL SDL definitions.

The generates files will be generated based on each module definition, and based on the GraphQL schema defined in that specific module, allowing you to write type-safe resolvers, while keeping modules types boundaries.

:::caution Usage Requirements

This preset generates code for `graphql-modules` @ `v1` / `v2` (previous versions are not supported) by default.

If you are not using `graphql-modules`, you can set `useGraphQLModules: false` to disable this behaviour.

:::

## Configuration

{@apiDocs}

## Usage Example

Given a folder structure with the following files:

```
- src/
  - modules/
    - user/
      - resolvers.ts
      - typedefs/
        - user.graphql
    - product/
      - resolvers.ts
      - typedefs/
        - product.graphql
```

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
import { MyModule } from './generated-types/module-types'

export const resolvers: MyModule.Resolvers = {
  // Here you can implement only the types and fields defined in your module!
}
```

> You can find [an example project here](https://github.com/dotansimha/graphql-code-generator/tree/master/dev-test/modules).

## Using without GraphQL-Modules

By default, this preset it generating code for `graphql-modules`, but if you are not using it, you can set `useGraphQLModules: false` in your preset configuration to generate fully agnostic types that are based on folder structure only.
