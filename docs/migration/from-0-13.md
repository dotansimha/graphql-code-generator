---
id: from-0-13
title: Migration from 0.13
---

## What has changed?

In >= 0.14 we changed the way you pass configuration to GraphQL Code Generator.

In the previous versions of the code-generator, the configuration was confusing and passed through 3 ways: CLI flags, config file (`gql-gen.json` and environment variables.

It became very confusing and difficult to use, so we decided to merge all existing configurations into a single .yml file - `codegen.yml`.

## How to migrate?

To migrate from GraphQL Code Generator v0.13 API to >=0.14, just start by installing the latest version of `graphql-code-generator` from NPM.

Then, run your existing `gql-gen ...` command as is. You'll see a warning about your current usage.

The new CLI makes it much easier - it will show you how your `codegen.yml` file should look according to your usage with the old API:

![CLI Migration](/img/v13-migration-cli.gif)

Now, create a file called `codegen.yml` with the content that the codegen suggests for you.

Next, update your NPM scripts to run `gql-gen` only, without any cli-flags:

```json
{
  "name": "my-project",
  "scripts": {
    "generate": "gql-gen"
  }
}
```

Now, replace your deprecated `templates` packages with the new `plugins` packages.

For example, if you were using `graphql-codegen-typescript-template`, you should replace it with: `graphql-codegen-typescript`, and `graphql-codegen-typescript-operations`.

Note sure which new packages you need to use now? [You can take a look here](https://github.com/dotansimha/graphql-code-generator/tree/master/packages/old-templates). Under each directory you'll find a `package.json` pointing to the new packages names.
