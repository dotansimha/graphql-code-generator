---
id: cli-commands
title: CLI Commands
---

The GraphQL Code Generator CLI can be used through the `gql-gen` executable whose behavior is controlled with a set of given options:

    $ gql-gen [...options] [...documents]

`documents` represent space separated paths or glob patterns for files which export GraphQL documents using a `gql` tag or a plain string; for example: `./src/**/*.graphql`. If no documents are specified only the server schema types will be generated.

## Available CLI options

Depends on your needs, you can provide the CLI with different options, which are listed below:

| Flag Name            | Type     | Description                                                                                                                                                                                                                                                          |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -s, --schema         | String   | Local or remote path to GraphQL schema: Introspection JSON file, GraphQL server endpoint to fetch the introspection from, local file that exports `GraphQLSchema`, JSON object or AST string, or Glob expression for `.graphql` files (e.g. `"./src/**/*.graphql"`)  |
| -cs, --client-schema | String   | Local path to GraphQL schema: Introspection JSON file, local file that exports `GraphQLSchema`, JSON object or AST string, or Glob expression for `.graphql` files (e.g. `"./src/**/*.graphql"`)                                                                     |
| -ms, --merge-schema  | String   | Merge schemas with a merge module (`moduleName#mergeFunctionExportedFromThisModule`)                                                                                                                                                                                 |
| -r, --require        | String   | Path to a `require` extension. See [reference](https://gist.github.com/jamestalmage/df922691475cff66c7e6) for more info                                                                                                                                              |
| -h, --header         | String   | Header to add to the introspection HTTP request when using remote endpoint                                                                                                                                                                                           |
| -t, --template       | String   | Template name, for example: "typescript" (not required when using `--project`)                                                                                                                                                                                       |
| -p, --project        | String   | Project directory with templates (see [custom template page](../custom-codegen/template))                                                                                                                                                                            |
| --template-config    | String   | Path to project config JSON file (see [custom template page](../custom-codegen/template)). Defaults to `gql-gen.json`                                                                                                                                                |
| --config             | String   | Path to code generation config. Useful if you have a lot of options to pass (see [options config page](./codegen-config))                                                                                                                                            |
| -o, --out            | String   | Path to output file/directory. When using single-file generator specify filename, and when using multiple-files generator specify a directory                                                                                                                        |
| -m, --skip-schema    | void     | If specified, server side schema won't be generated through the template (enums won't be omitted)                                                                                                                                                                    |
| -c, --skip-documents | void     | If specified, client side documents won't be generated through the template                                                                                                                                                                                          |
| --no-overwrite       | void     | If specified, the generator will not override existing files                                                                                                                                                                                                         |
| -w --watch           | boolean  | Enables watch mode for regenerating documents from schema. Be sure to have [Watchman](https://facebook.github.io/watchman/) installed before using!                                                                                                                  |
| --silent             | boolean  | Do not print anything to the console                                                                                                                                                                                                                                 |

Alternatively you can run `$ gql-gen --help` at any given point to get a detailed description of the possible options in your terminal.

## Examples

Here are some general usage patterns which might come in handy:

- With local introspection JSON file, generate TypeScript types:

```
$ gql-gen --schema mySchema.json --template graphql-codegen-typescript-template --out ./typings/ "./src/**/*.graphql"
```

- With local introspection JSON file, generate TypeScript files, from GraphQL documents inside code files (`.ts`):

```
$ gql-gen --schema mySchema.json --template graphql-codegen-typescript-template --out ./typings/ "./src/**/*.ts"
```

- With remote GraphQL endpoint that requires Authorization, generate TypeScript types:

```
$ gql-gen --schema http://localhost:3010/graphql --header "Authorization: MY_KEY" --template graphql-codegen-typescript-template --out ./typings/ "./src/**/*.graphql"
```
