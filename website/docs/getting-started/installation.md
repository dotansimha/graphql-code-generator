---
id: installation
title: Installation
---

## Installing Codegen

First we need to make sure that the basic GraphQL package is within our dependencies, since GraphQL Code Generator depends on it:

<!-- prettier-ignore -->
:::shell With `yarn`
    yarn add graphql
:::

<!-- prettier-ignore -->
:::shell With `npm`
    npm install --save graphql  
:::

Then we can install GraphQL Code Generator using `yarn` (or `npm`):

<!-- prettier-ignore -->
:::shell With `yarn`
    yarn add -D @graphql-codegen/cli
:::

<!-- prettier-ignore -->
:::shell With `npm`
    npm install --save-dev @graphql-codegen/cli
:::

:::caution Global Installation
Please avoid installing `graphql`, `@graphql-codegen/cli` and its plugins as global dependencies. This will cause issues because of duplications of the `graphql` package. Install it only locally in your project.
:::

:::caution Monorepo
If you are using Monorepo setup (Lerna/Yarn Workspaces/anything else), please note that GraphQL Codegen is using `require` to load plugins and file. This might break and fail in case of hoisting.

If you are having issues with loading GraphQL-Codegen plugins, make sure it's installed correctly, at the same level of `node_modules`, and make sure it's accessible and available for the Codegen CLI.
:::

## Initialization Wizard

After installing those dependencies, GraphQL Code Generator lets you set up everything by simply running the following command:

<!-- prettier-ignore -->
:::shell With `yarn`
    yarn graphql-codegen init
:::

<!-- prettier-ignore -->
:::shell With `npm`
    npx graphql-codegen init
:::

Question by question, it will guide you through the whole process of setting up a schema, selecting and installing plugins, picking a destination to where your files are generated, and a lot more.

If you don't want to use the wizard, we've got you covered, just continue reading the next sections.

## Setup

GraphQL Code Generator's behavior is bound into plugins, thus we will need to install one of them, for example:

<!-- prettier-ignore -->
:::shell With `yarn`
    yarn add -D @graphql-codegen/typescript
:::

<!-- prettier-ignore -->
:::shell With `npm`
    npm install --save-dev @graphql-codegen/typescript
:::

Although this can be used directly, it's recommended to add the code generation script to your `package.json`:

```json
{
  "scripts": {
    "generate": "graphql-codegen"
  }
}
```

This will simplify its usage, and you'll be able to run the codegen with the following command:

<!-- prettier-ignore -->
:::shell With `yarn`
    yarn generate
:::

<!-- prettier-ignore -->
:::shell With `npm`
    npm run generate
:::

GraphQL Code Generator looks for `codegen.yml` and `codegen.json` files by default. An example can be seen below:

```yaml
schema: http://localhost:3000/graphql
generates:
  ./src/types.d.ts:
    plugins:
      - typescript
```

## Running the codegen

By running the following command, the GraphQL schema will be fetched from the route endpoint and the typescript definitions will be generated in the specified destination:

<!-- prettier-ignore -->
:::shell With `yarn`
    yarn generate
:::

<!-- prettier-ignore -->
:::shell With `npm`
    npm run generate
:::
