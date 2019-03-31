---
id: codegen-config
title: Codegen Options Config
---

Having a config file fits well when we have a large amount of options to provide in order to generate some code. This can happen mostly in large scale projects where the GraphQL schema is pretty complex and we would like to generate a lot of different formats.

To generate code from a config file, you can simply create a `codegen.yml` or `codegen.json` file and run `$ graphql-codegen`. The CLI will automatically detect the defined config file and will generate code accordingly. In addition, you can also define a path to your config file with the `--config` options, like so:

    $ graphql-codegen --config ./path/to/config.yml

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

A more robust config file can be seen [here](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/codegen.yml).

## Available Options

Here are the supported options that you can define in the config file (see [source code](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/utils/plugins-helpers/src/types.ts#L51)):

- [**`schema` (required)**](./schema-field#root-level) - A URL to your GraphQL endpoint, a local path to `.graphql` file, a glob pattern to your GraphQL schema files, or a JavaScript file that exports the schema to generate code from. This can also be an array which specifies multiple schemas to generate code from. [You can read more about the supported formats here](./schema-field#available-formats)

- [**`documents`**](./documents-field#root-level) - Array of paths or glob patterns for files which export GraphQL documents using a `gql` tag or a plain string; for example: `./src/**/*.graphql`. You can also provide this options with a string instead of an array, in case you're dealing with a single document. [You can read more about the supported formats here](./documents-field#available-formats)

- **`generates` (required)** - A map where the key represents an output path for the generated code and the value represents a set of options which are relevant for that specific file. Below are the possible options that can be specified:

  - **`generates.plugins` (required)** - A list of plug-ins to use when generating the file. Templates are also considered as plug-ins and they can be specified in this section. A full list of supported plugins can be found [here](../plugins). You can also point to a custom plugin in a local file (see [Custom Plugins](../custom-codegen/index) section)

  - [**`generates.documents`**](./documents-field#output-file-level) - Same as root `documents`, but applies only for the specific output file.

  - [**`generates.schema`**](./schema-field#output-file-level) - Same as root `schema`, but applies only for the specific output file.

  - [**`generates.config`**](./config-field#output-level) - Same as root `config`, but applies only for the specific output file.

  - [**`generates.overwrite`**](./config-field#output-level) - Same as root `overwrite`, but applies only for the specific output file.

- [**`require`**](./require-field) - A path to a file which defines custom Node.JS `require()` handlers for custom file extensions. This is essential if the code generator has to go through files which require other files in an unsupported format (by default). See [more information](https://gist.github.com/jamestalmage/df922691475cff66c7e6).

- [**`config`**](./config-field#root-level) - Options that we would like to provide to the specified plug-ins. The options may vary depends on what plug-ins you specified. Read the documentation of that specific plug-in for more information. [You can read more about how to pass configuration to plugins here](./config-field)

- **`overwrite`** - A flag to overwrite files in case they're already exist when generating code (`true` by default)

- **`watch`** - A flag to watch for changes in the specified GraphQL schemas and re-generate code any that happens. You can either specify a boolean to turn it on/off, or specify an array of glob patterns to add custom files to the watch.

- **`silent`** - A flag to not print errors in case they occur.

- **`pluginLoader`** - If you are using the programmatic API in browser environment, you can override this configuration to load your plugins in a way different then `require`.

- **`pluckConfig`** - Allow you to override the configuration for `graphql-tag-pluck` (the tool that extracts your GraphQL operations from your code files).

  - **`pluckConfig.modules`** - An array of `{ name: string, identifier: string }` that will be used to track down your `gql` usages and imports. Use this if your code files imports `gql` from another library, or you have a custom `gql` tag.

  - **`pluckConfig.magicComment`** - Configure the magic GraphQL comments to look for (the default is `/* GraphQL */`).

  - **`pluckConfig.globalIdentifier`** - Overrides the name of the default GraphQL name identifier.
