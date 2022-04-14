---
id: kotlin
---

The `kotlin` plugin generates Kotlin `classes` for Enums and Input types.

You can use this plugin to generate Java enums based on your GraphQL schema, and it also generates a type-safe Kotlin transformer for GraphQL `input` types.

## Prepare your environment

To get started with these plugins and preset, make sure you have the following installed:

- NodeJS (10 or later)
- NPM or Yarn

Run the following in your Android project:

```sh
yarn init --yes
yarn add @graphql-codegen/cli graphql @graphql-codegen/kotlin
```

Then, create `codegen.yml` with the following configuration:

```yaml
schema: POINT_TO_YOUR_SCHEMA
documents: POINT_TO_YOUR_GRAPHQL_OPERATIONS
generates:
  ./app/src/Types.kt:
    plugins:
      - kotlin
```

> Also, make sure to add `node_modules` to your `.gitignore` file.

{@apiDocs}
