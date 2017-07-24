# `graphql-codegen-cli`

[Refer to full documentation, examples and more here](https://github.com/dotansimha/graphql-code-generator/blob/master/README.md)

This package is the front-facing package of the code generator.

It parses the CLI commands into a `GeneratorConfig` and `Settings` object, and also in charge of reading and writing files from the filesystem, and execute Introspection request to remote GraphQL endpoints.

For a full CLI documentation, please refer to the main `README` file of the package.

## `gql-gen.json`

`gql-gen.json` is a local config file, provides a custom config when using custom templates.

This is an example for a valid file:

```json
{
  "flattenTypes": true,
  "primitives": {
    "String": "string",
    "Int": "number",
    "Float": "number",
    "Boolean": "boolean",
    "ID": "string"
  },
  "customHelpers": {
    "myHelper": "./my-helper.js"
  }
}
```

You can override the config for `flattenTypes` and `primitives` (refer to `graphql-codegen-compiler` package README for more info).

You can also specify JavaScript files for `customHelpers` when generating custom templates (the custom files should export a `Function` as default).
