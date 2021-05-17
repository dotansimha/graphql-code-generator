---
id: require-field
title: '`require` field'
---

The `require` field allows you to load any external files without the need to transpile them before.

## How to use it?

To use it, install the extensions you wish to use from npm and then specify a list of `require` extensions in your root config:

```yml
require:
  - extension1
  - extension2
```

Adding `require` extension is useful if you are loading your `GraphQLSchema` or GraphQL documents from a [code file](schema-field.md#javascript-export), if you wish to use [custom plugins](../custom-codegen/write-your-plugin.md), or use a [custom schema loader](schema-field.md#custom-schema-loader) or a [custom document loader](documents-field.md#custom-document-loader).

## TypeScript Support

If you wish to use TypeScript, just add [`ts-node`](https://github.com/TypeStrong/ts-node) from npm and specify its register export in your config file:

```yml
require:
  - ts-node/register
```

## Specifying from the command line

You can also specify `require.extensions` as a cli flag using `-r`.

Specifying `-r` using a CLI flag will load your `require.extension` _before_ loading the `.yml` file, and this way you can load environment variables using `dotenv` and use those environment variables in your `.yml` config file.

### `dotenv` Integration

If you wish to use [dotenv](https://github.com/motdotla/dotenv) to load environment variables, you can install `dotenv` from npm and then to use the `require` cli flag to preload the `dotenv` require extensions: `-r dotenv/config`.

It will make sure to load your `.env` file before executing the codegen and loading your `.yml` file, so environment variables that are used in your config file will be replaced with the correct value.

To get started with this integration, make sure you have `.env` file with variables, `dotenv` installed, and codegen is being executed like that:

    graphql-codegen --require dotenv/config --config codegen.yml

#### Customize loaded env file

If you wish to load a file different than `.env` file, please follow [`dotenv` library documentation](https://github.com/motdotla/dotenv#dotenv).

It allows you to specify a custom file path using 2 methods.

You can either set an environment variable called `DOTENV_CONFIG_PATH` with the path:

    DOTENV_CONFIG_PATH="./my.env" graphql-codegen --require dotenv/config --config codegen.yml

> Note: You can use `cross-env` library if you are using Windows.

Or, you can specify it using codegen cli, like that:

    graphql-codegen --require dotenv/config --config codegen.yml dotenv_config_path=my.env
    
#### `dotenv` Example
.env:

    SCHEMAURL=https://example.com/graphql
    APIKEY=ABC123

codegen.yml:

    schema: 
      - ${SCHEMAURL}:
        headers:
          apikey: ${APIKEY}
      
  > Note: The env values might be saved in the generated code output.  Be careful not to commit code with sensitive keys.
