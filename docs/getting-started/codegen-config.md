---
id: codegen-config
title: Codegen Options Config
---

When we have a large amount of options to provide in order to generate some code, the CLI can get pretty inconvenient. This can happen mostly in large scale projects where the GraphQL schema is pretty complex and we would like to generate a lot of different formats. Luckily we've already thought about it and prepared our code generator.

To solve that issue you can list all your option in a `yml` or `json` config file, where it's gonna look much cleaner visually and would be easier to maintain. The config file is based on the [available CLI options](./cli-commands), so there isn't much of a difference except for few tweaks here in there.

To generate code from a config file, you can simply create a `codegen.yml` or `codegen.json` file and run `$ gql-gen`. The CLI will automatically detect the defined config file and will generate code accordingly. In addition, you can also define a path to your config file with the `--config` options, like so:

    $ gql-gen --config ./path/to/config.yml

Here's an example for a possible config file:

```yml
schema: http://localhost:3000/graphql
overwrite: true
watch: true
generates:
  ./dev-test/githunt/types.ts:
    schema: ./dev-test/githunt/schema.json
    documents: ./dev-test/githunt/**/*.graphql
    plugins:
      - typescript-common
      - typescript-client
```

A more robust config file can be seen [here](https://github.com/dotansimha/graphql-code-generator/blob/70003040cfc3bf01a3d8eea9d4b2b5adec4ef77a/dev-test/codegen.yml).

## Available Options

Here are the supported options that you can define in the config file (see [source code](https://github.com/dotansimha/graphql-code-generator/blob/70003040cfc3bf01a3d8eea9d4b2b5adec4ef77a/packages/graphql-codegen-core/src/new-types.ts#L36)):

- **`schema` (required)** - A URL to your GraphQL endpoint, a local path or a glob pattern to your GraphQL schema to generate code from. This can also be an array which specifies multiple schemas to generate code from.

- **`generates` (required)** - A map where the key represents an output path for the generated code and the value represents a set of options which are relevant for that specific file. Below are the possible options that can be specified:

  - **`generates.plugins` (required)** - A list of plug-ins to use when generating the file. Templates are also considered as plug-ins and they can be specified in this section, such as `typescript-common` or `typescript-mongodb`. A full list of supported templates can be found [here](../templates).

  - **`generates.documents`** - Same as root `documents`.

  - **`generates.schema`** - Same as root `schema`.

  - **`generates.config`** - Same as root `config`.

- **`documents`** - Array of paths or glob patterns for files which export GraphQL documents using a `gql` tag or a plain string; for example: `./src/**/*.graphql`. You can also provide this options with a string instead of an array, in case you're dealing with a single document.

- **`require`** - A path to a file which defines custom Node.JS `require()` handlers for custom file extensions. This is essential if the code generator has to go through files which require other files in an unsupported format (by default). See [more information](https://gist.github.com/jamestalmage/df922691475cff66c7e6).

- **`mergeSchemaFiles`** - A name of a modules along with its exported merge function name. Use the following pattern: `moduleName#mergeFunctionExportedFromThisModule`.

- **`config`** - Options that we would like to provide to the specified plug-ins, such as `avoidOptionals` or `imutableTypes`. The options may vary depends on what plug-ins you specified. Read the documentation of that specific plug-in for more information.

- **`overwrite`** - A flag to overwrite files in case they're already exist when generating code.

- **`watch`** - A flag to watch for changes in the specified GraphQL schemas and re-generate code any that happens.

- **`silent`** - A flag to not print errors in case they occur.
