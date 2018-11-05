---
id: template
title: Custom Output Template
---

Based on your needs, you can define a custom [Handlebars template](https://handlebarsjs.com/) that will generate code. The given data models will be based on the parsed data by GraphQL Code Generator.

To do so, you will first need to define a file called `gql-gen.json` in your project's root dir which will map primitive types from GraphQL to your desired format. Below is an object which will map GraphQL types to TypeScript types:

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

As you can see there's also an extra flag defined called `flattenTypes` which will tell the code generator whether we would like to flatten selection sets or not (see [further info](./package#flattentypes)).

Now you can start creating templates across your project. The template file name has to follow the pattern `{file-prefix}.{file-extension}.{required-context}.gqlgen`. The file pattern will determine the output and the behavior of the template, so given the file name `hoc.js.all.gqlgen`:

- The name of the output file will be `hoc.js`.
- The template will be called with `all` compilation context (see [available compilation contexts](./package#templates)).

```handlebars
{{#each types}}
    GraphQL Type: {{ name }}
{{/each}}
```

Now you can generate code with `gql-gen` and compile your templates by specifying the `--project` options; it will specify the path for the custom templates dir:

    $ gql-gen --project ./templates/ --out ./src/generated --file ./schema.json "./src/graphql/**/*.graphql"

Note that the templates files have to have an extension which is one of `template`, `tmpl`, `gqlgen` or `handlebars`, otherwise the template won't be compiled.

## Tips, tricks, and gotchas

**Any subdirectory structure will be maintained in the output.** When using the `eachImport` helper, note that the import `file` is just the filename, so you'll have to [handle relative paths yourself](https://github.com/micimize/graphql-to-io-ts/blob/master/src/helpers/relative-import.js).

**All templates in your template directory will be registered with `registerPartial(filename.split('.').reverse()[1], template)`, so `ts.type.gqlgen` becomes the partial `type`.** This means you can easily use `{{> type }}` in `ts.inputType.gqlgen`, but also means that multiple templates using the same context might clobber each other in the partial registry. If this is a problem, simply make a separate partial with a unique name like `prefixPartial.handlebars`.
