# Custom Templates

This generator also allow you to generate custom custom template from your GraphQL Schema.

This way you can generate custom code based on your GraphQL schema / operations.

To start using GraphQL code generator with custom templates, install the CLI module, and then create a JSON file called `gql-gen.json` in your project's root directory, specifying the following:

```json
{
  "flattenTypes": true,
  "primitives": {
    "String": "string",
    "Int": "number",
    "Float": "number",
    "Boolean": "boolean",
    "ID": "string"
  }
}
```

> The purpose of this file to to tell the GraphQL code generate if you want to flatten selection set, and specify your environment's scalars transformation, for example: `String` from GraphQL is `string` in TypeScript.

> To understand what `primitives` and `flattenTypes` are doing behind the scenes, [refer to `graphql-codegen-generators` package README](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-core/README.md#flattentypes)

Now create a simple template file with this special structure: `{file-prefix}.{file-extension}.{required-context}.gqlgen`, for example: `hoc.js.all.gqlgen`, and use any custom template, for example:

```handlebars
{{#each types}}
    GraphQL Type: {{ name }}
{{/each}}
```

This file will compile by the generator as Handlebars template, with the `all` context, and the result file name will be `hoc.js`.

To see a full list of available contexts, [refer to `graphql-codegen-generators` package README](https://github.com/dotansimha/graphql-code-generators/blob/master/packages/graphql-codegen-generators/README.md#templates)

Next, run the generator from the CLI, but use `project` flag (instead of `template`), and specify the base path for you templates (the generator will look for the following file extensions: `template`, `tmpl`, `gqlgen`, `handlebars`):

    $ gql-gen --project ./src/ --file ./schema.json "./src/graphql/**/*.graphql"

> No need to specify the output directory, since the generator will create the generated files next to the template.
