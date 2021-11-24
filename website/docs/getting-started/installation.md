---
id: installation
title: Installation
---

## Installing Codegen

First, make sure that you the `graphql` package in your project's dependencies, since GraphQL Code Generator depends on it:

    npm install --save graphql
    # or, with yarn:
    yarn add graphql

Then, install the GraphQL Code Generator CLI package:

    npm install --save @graphql-codegen/cli
    # or, with yarn:
    yarn add -D @graphql-codegen/cli


:::caution Global Installation
Please avoid installing `graphql`, `@graphql-codegen/cli` and its plugins as global dependencies. This will cause issues because of duplications of the `graphql` package. Install it only locally in your project.
:::


:::caution Monorepo Project
If you are using Monorepo setup (Lerna/Yarn Workspaces/anything else), please note that GraphQL Codegen is using `require` to load plugins and file. This might break and fail in case of hoisting.

If you are having issues with loading GraphQL-Codegen plugins, make sure it's installed correctly, at the same level of `node_modules`, and make sure it's accessible and available for the Codegen CLI.
:::

## Initialization Wizard

After installing those dependencies, GraphQL Code Generator can help you configure your project based on some popular flows:

    yarn graphql-codegen init
    # or, with npx:
    npx graphql-codegen init

Question by question, it will guide you through the whole process of setting up a schema, selecting and installing plugins, picking a destination to where your files are generated, and a lot more.

If you don't want to use the wizard, we've got you covered, just continue reading the next sections.

## Manual Setup

If you wish to configure codegen manually, please start by creating a `codegen.yml` file in your project's root directory:

```yaml
schema: schema.graphql # you can also point to a GraphQL endpoint!
generates:
  types.ts:
    plugins:
      - @graphql-codegen/typescript
```

GraphQL Code Generator's behavior is bound into plugins, thus we will need to install one of them, for example, if you are using `@graphql-codegen/typescript` plugin, please make sure install it locally in your project

Although this can be used directly, it's recommended to add the code generation script to your `package.json`:

```json
{
  "scripts": {
    "generate": "graphql-codegen"
  }
}
```

This will simplify its usage, and you'll be able to run the codegen with the following command: `npm run generate`.

You can learn more about [`codegen.yml` and the available configurations here](/docs/getting-started/config-reference/codegen-config), and [you can find a list of all available plugins here](/plugins)
