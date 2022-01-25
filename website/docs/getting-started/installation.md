---
id: installation
title: Installation
---

## Installing Codegen

Make sure that you add both the `graphql` and `@graphql-codegen/cli` packages in your project's dependencies:

<PackageInstall packages={["graphql", "@graphql-codegen/cli"]} />

:::caution Global Installation
Please avoid installing `graphql`, `@graphql-codegen/cli`, and its plugins as global dependencies. This will cause issues because of duplications of the `graphql` package. Install it only locally in your project.
:::

:::caution Monorepo Project
If you are using Monorepo setup (Lerna/Yarn Workspaces/anything else), please note that GraphQL Codegen is using `require` to load plugins and files. This might break and fail in case of hoisting.

If you are having issues with loading GraphQL-Codegen plugins, make sure it's installed correctly, at the same level of `node_modules`, and make sure it's accessible and available for the Codegen CLI.
:::


GraphQL Code Generator comes with dozen plugins, from front-end to back-end, from web apps to mobile apps.
If you are not sure which plugins might be helpful for your GraphQL stack, give a try at the [_Initialization Wizard_](#initialization-wizard).

Otherwise, you can start exploring the [plugins](/plugins) and [setting up them manually](#manual-setup).

<p>&nbsp;</p>

----

<p>&nbsp;</p>

## Setup

### Initialization Wizard

Once installed, GraphQL Code Generator CLI can help you configure your project based on some popular flows:


<PackageRun scripts={['graphql-codegen init', 'install # install the choose plugins']} />


Question by question, it will guide you through the whole process of setting up a schema, selecting and installing plugins, picking a destination to where your files are generated, and a lot more.

:::info npx
The init process above can also be run through `npx`.
:::


### Manual Setup

Once GraphQL Code Generator is installed and added to your project's development workflow (scripts), you can start installing plugins and configuring them.

If you are looking for the **best way to leverage GraphQL Code Generator on your stack**, you should read one of our _Guides_.

On top of each plugin documentation, we provide one Guide for the most famous framework such as [React](/docs/guides/react) or [Apollo Server](/docs/guides/graphql-server-apollo-yoga).
Each guide exposes the best plugins and configurations available for each framework and stack (React with Apollo / URQL / React Query, Angular with Apollo, ...).

<br />

Otherwise, if you **prefer exploring plugins and skipping the high-level explanations**, the go-to ressources will be the [plugins documentation](/plugins) and the [`codegen.yaml` API reference documentation](/docs/config-reference/codegen-config).
