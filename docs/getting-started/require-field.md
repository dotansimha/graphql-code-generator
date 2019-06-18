---
id: require-field
title: `require` field
---

The GraphQL Code-Generator also support `require` extensions - that means that you can load any external files without the need to transpile it before.

## How to use it?

To use it, install the extensions you wish to use from npm and then specify a list of `require` extensions in your root config:

```yml
require:
  - extension1
  - extension2
```

Adding `require` extension is useful if you are loading your `GraphQLSchema` or GraphQL documents from a [code file](./schema-field#javascript-export), if you wish to use [custom plugins](../custom-codegen/write-your-plugin), or use a [custom schema loader](./schema-field#custom-schema-loader) or a [custom document loader](documents-field#custom-document-loader).

## TypeScript Support

If you wish to use TypeScript, just add [`ts-node`](https://github.com/TypeStrong/ts-node) from npm, and specify it's register export in your config file:

```yml
require:
  - ts-node/register
```

## Specifying from the command line

You can also specify `require.extensions` as a cli flag, using `-r`.

Specifying `-r` using a CLI flag will load your `require.extension` _before_ loading the `.yml` file, and this way you can load environment variables using `dotenv`,and use those environment variables in your `.yml` config file.

### `dotenv` Integration

If you wish to use [dotenv](https://github.com/motdotla/dotenv) to load environment variables, you can install `dotenv` from npm, and then to use `require` cli flag to preload the `dotenv` require extensions: `-r dotenv/config`.

It will make sure to load your `.env` file before executing the codegen and loading your `.yml` file.
