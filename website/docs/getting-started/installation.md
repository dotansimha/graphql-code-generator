---
id: installation
title: Installation
---

## Installing Codegen 

First we gotta make sure that the basic GraphQL package is within our dependencies, since GraphQL Code Generator is depends on it:
  
:::shell With `yarn`
    $ yarn add graphql
:::

:::shell With `npm`
    $ npm install --save graphql  
:::

The we can install GraphQL Code Generator using `yarn` (or `npm`):

:::shell With `yarn`
    $ yarn add -D @graphql-codegen/cli
:::

:::shell With `npm`
    $ npm install --save-dev @graphql-codegen/cli
:::

:::caution Global Installation
Please avoid installing `graphql`, `@graphql-codegen/cli` and it's plugins as global dependencies. This will cause issues because of duplications of `graphql` package. Install it only locally in your project.
:::

## Initialization Wizard

GraphQL Code Generator lets you setup everything by simply running the following command:

:::shell With `yarn`
    $ yarn graphql-codegen init
:::

:::shell With `npm`
    $ npx graphql-codegen init
:::

Question by question, it will guide you through the whole process of setting up a schema, selecting and installing plugins, picking a destination of a generated file and a lot more.

If you don't want to use the wizard, we've got you covered, just continue reading the next sections.

## Setup

GraphQL Code Generator's behavior is bound into plugins, thus we will need to install one of them, for example:

:::shell With `yarn`
    $ yarn add -D @graphql-codegen/typescript
:::

:::shell With `npm`
    $ npm install --save-dev @graphql-codegen/typescript
:::

Although can be used directly, it's recommended to add the code generation script in your `package.json`:

```json
{
  "scripts": {
    "generate": "graphql-codegen"
  }
}
```

This will simply your usage, and you'll be able to run the codegen with the following command:

GraphQL Code Generator looks for `codegen.yml` and `codegen.json` files by default, one might look like this:

```yaml
schema: http://localhost:3000/graphql
generates:
  ./src/types.d.ts:
    plugins:
      - typescript
```

## Running the codegen

By running the following command the GraphQL schema will be fetched from the route endpoint and the typescript definitions would be generated in the specified destination:

:::shell With `yarn`
    $ yarn generate
:::

:::shell With `npm`
    $ npm run generate
:::

