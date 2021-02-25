---
id: codegen-config
title: codegen.yml
---

Having a config file fits well when we have a large amount of options to provide in order to generate some code. This can happen mostly in large scale projects where the GraphQL schema is pretty complex and we would like to generate a lot of different formats.

To pass configuration to GraphQL Codegen, you need to simply create a `codegen.yml` or `codegen.json` file and run the codegen.

The CLI will automatically detect the defined config file and will generate code accordingly. In addition, you can also define a path to your config file with the `--config` options, like so:

:::shell With `yarn`
yarn graphql-codegen --config ./path/to/config.yml
:::

:::shell With `npm`
npx graphql-codegen --config ./path/to/config.yml
:::

Here's an example for a possible config file:

```yml
schema: http://localhost:3000/graphql
documents: ./src/**/*.graphql
generates:
  ./src/types.ts:
    plugins:
      - typescript
      - typescript-operations
```

An example for a very large config file can be seen [here](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/codegen.yml).

:::tip YAML Config Validation & auto-complete

If you are using VSCode as your IDE, make sure to [install the YAML plugin](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml), this will add validation and auto-complete for available plugins, plugins config and general structure of the `codegen.yml` file!

:::

## Available Options

Here are the supported options that you can define in the config file (see [source code](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/utils/plugins-helpers/src/types.ts#L92)):

- [**`schema` (required)**](schema-field.md#root-level) - A URL to your GraphQL endpoint, a local path to `.graphql` file, a glob pattern to your GraphQL schema files, or a JavaScript file that exports the schema to generate code from. This can also be an array which specifies multiple schemas to generate code from. You can read more about the supported formats [here](schema-field.md#available-formats).

- [**`documents`**](documents-field.md#root-level) - Array of paths or glob patterns for files which export GraphQL documents using a `gql` tag or a plain string; for example: `./src/**/*.graphql`. You can also provide this options with a string instead of an array, in case you're dealing with a single document. You can read more about the supported formats [here](documents-field.md#available-formats).

- **`generates` (required)** - A map where the key represents an output path for the generated code and the value represents a set of options which are relevant for that specific file. Below are the possible options that can be specified:

  - **`generates.plugins` (required)** - A list of plugins to use when generating the file. Templates are also considered as plugins and they can be specified in this section. A full list of supported plugins can be found [here](../plugins/index.md). You can also point to a custom plugin in a local file (see [Custom Plugins](../custom-codegen/index.md)).
  
  - [**`generates.preset`**](../presets/index.md) - A list of available presets for generated files. Such as [`near-operation-file`](../presets/near-operation-file.md#example), which generates files alongside your documents.

  - [**`generates.schema`**](schema-field.md#output-file-level) - Same as root `schema`, but applies only for the specific output file.

  - [**`generates.documents`**](documents-field.md#output-file-level) - Same as root `documents`, but applies only for the specific output file.

  - [**`generates.config`**](config-field.md#output-level) - Same as root `config`, but applies only for the specific output file.

  - **`generates.overwrite`** - Same as root `overwrite`, but applies only for the specific output file.

- [**`require`**](require-field.md) - A path to a file which defines custom Node.JS `require()` handlers for custom file extensions. This is essential if the code generator has to go through files which require other files in an unsupported format (by default). See [more information](https://gist.github.com/jamestalmage/df922691475cff66c7e6). Note that values that specified in your `.yml` file will get loaded after loading the `.yml` file.

- [**`config`**](config-field.md#root-level) - Options that we would like to provide to the specified plugins. The options may vary depends on what plugins you specified. Read the documentation of that specific plugin for more information. You can read more about how to pass configuration to plugins [here](config-field.md).

- **`overwrite`** - A flag to overwrite files if they already exist when generating code (`true` by default).

- **`watch`** - A flag to trigger codegen when there are changes in the specified GraphQL schemas. You can either specify a boolean to turn it on/off or specify an array of glob patterns to add custom files to the watch.

- **`silent`** - A flag to suppress printing errors when they occur.

- **`errorsOnly`** - A flag to suppress printing anything except errors.

- **`hooks`** - Specifies scripts to run when events are happening in the codegen's core. You can read more about lifecycle hooks [here](lifecycle-hooks.md). You can specify this on your root configuration or on each output.

- **`pluginLoader`** - If you are using the programmatic API in a browser environment, you can override this configuration to load your plugins in a way different than `require`.

- **`pluckConfig`** - Allows you to override the configuration for `graphql-tag-pluck`, the tool that extracts your GraphQL operations from your code files.

  - **`pluckConfig.modules`** - An array of `{ name: string, identifier: string }` that will be used to track down your `gql` usages and imports. Use this if your code files imports `gql` from another library or you have a custom `gql` tag. `identifier` is the named export, so don't provide it if the tag function is imported as default.

  - **`pluckConfig.gqlMagicComment`** - Configures the magic GraphQL comments to look for. The default is `/* GraphQL */`).

  - **`pluckConfig.globalGqlIdentifierName`** - Overrides the name of the default GraphQL name identifier.

## Environment Variables

You can use environment variables in your `codegen.yml` file::

```yml
schema: ${SCHEMA_PATH}
documents: ./src/**/*.graphql
generates:
  ./src/types.ts:
    plugins:
      - typescript
      - typescript-operations
```

You can load an `.env` file by adding the `-r dotenv/config` option to your CLI command.

You can specify a default value in case an environment variable is missing:

```yml
schema: ${SCHEMA_PATH:schema.graphql}
```

## CLI Flags

The Codegen also supports several CLI flags that allow you to override the default behaviour specified in your `.yml` config file:

- **`--config` (`-c`)** - Specifies the codegen config file to use.

- **`--watch` (`-w`)** - Overrides the `watch` config to true. You can also specify a glob expression to create a custom watch list.

- **`--silent` (`-s`)** - Overrides the `silent` config to true.

- **`--errors-only` (`-e`)** - Overrides the `errorsOnly` config to true.

- **`--require` (`-r`)** - Specifies `require.extensions` before loading the `.yml` file.

- **`--overwrite` (`-o`)** - Overrides the `overwrite` config to true.

## Debug Mode

You can set the `DEBUG` environment variable to `1` in order to tell the codegen to print debug information.

You can set the `VERBOSE` environment variable to `1` in order to tell the codegen to print more information regarding the CLI output (`listr`).

## Other ways to provide configuration

GraphQL-Codegen is using [`cosmiconfig`](https://github.com/davidtheclark/cosmiconfig) library to manage configuration loading.

That means, you can use `codegen.yml`, but also `codegen.json` or `codegen.js` will work. You can also specify the entire configuration under a key called `"codegen"` in your `package.json`.

For more information, [please refer to `cosmiconfig` documentation](https://github.com/davidtheclark/cosmiconfig#cosmiconfig).

GraphQL-Codgen is also integratable with [`GraphQL-Config](https://graphql-config.com/), so you can specify `.graphqlrc` as your configuration file.
