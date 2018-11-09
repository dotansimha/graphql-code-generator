# Custom Templates using `--project` flag

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

> To understand what `primitives` and `flattenTypes` are doing behind the scenes, [refer to this README](../scripts/codegen-templates-scripts/README.md#flattentypes)

Now create a simple template file with this special structure: `{file-prefix}.{file-extension}.{required-context}.gqlgen`, for example: `hoc.js.all.gqlgen`, and use any custom template, for example:

```handlebars
{{#each types}}
    GraphQL Type: {{ name }}
{{/each}}
```

This file will compile by the generator as Handlebars template, with the `all` context, and the result file name will be `hoc.js`.

To see a full list of available contexts, [refer to this README](../scripts/codegen-templates-scripts/README.md#templates)

Next, run the generator from the CLI, but use `project` flag (instead of `template`), and specify the base path for you templates (the generator will look for the following file extensions: `template`, `tmpl`, `gqlgen`, `handlebars`):

    $ gql-gen --project ./templates/ --out ./src/generated --file ./schema.json "./src/graphql/**/*.graphql"

#### tips, tricks, and gotchas

**Any subdirectory structure will be maintained in the output.** When using the `eachImport` helper, note that the import `file` is just the filename, so you'll have to [handle relative paths yourself](https://github.com/micimize/graphql-to-io-ts/blob/225fe92b4c37dbb674d31ea0deccdd5fe050d2b3/helpers/relative-import.js).

**All templates in your template directory will be registered with `registerPartial(filename.split('.').reverse()[1], template)`, so `ts.type.gqlgen` becomes the partial `type`.** This means you can easily use `{{> type }}` in `ts.inputType.gqlgen`, but also means that multiple templates using the same context might clobber eachother in the partial registry. If this is a problem, simply make a seperate partial with a unique name like `prefixPartial.handlebars`.
