---
id: package
title: Template as NPM Package
---

# Script utils for Handlebars Templates

Create GraphQL Codegen templates easily with this Handlebars.

This package exposes a CLI util called `codegen-templates-scripts` which allow you to easily create a GraphQL Codegen Template project, and built it without dealing with external utils.

To get started with this package, install it globally, or as local dependency inside an existing directory:

    $ yarn global add codegen-templates-scripts

Then, to start a new project, create a directory for your template project:

    $ mkdir my-codegen-template
    $ cd my-codegen-template

Now, run the following command inside your directory:

    yarn codegen-templates-scripts init

> If some files such as `package.json` are already exists in this dir, please use `--overwrite` to make sure it changes it as well.

Now, install the boilerplate dependencies by running:

    yarn

The CLI util will create the boilerplate for you, so all you have to do it to write your own templates under `src/` and defined it in `config.ts` file.

## Testing your template locally

To test your template locally, you can either test it on a real project and use `--template` and point it to your development directory (make sure to build it before).

Or, take a look at the tests directory and see the unit-tests examples. To run these test just use `yarn test`.

## Building and Publishing your template

This package comes with a built-in `build` command.

All you have to do is to run `yarn build` inside your project directory, in order to build it.

To publish your package, just use `npm publish` - everything else it already set for you.

## `config.ts`

This file is in charge of configuration and declaration of your templates.

### inputType

Allowed values: `EInputType.SINGLE_FILE`, `EInputType.MULTIPLE_FILES`

`inputType` defined the template input type of the generator, and also declares the generator output.

For example, we have TypeScript generators for both single and multiple files.

The input type field effects the rest of the fields:

#### _SINGLE_FILE_

When using `SINGLE_FILE`, you must specify the main template name, with a key called `index`, and this will be the root of your app.

You also need to specify the `outFile` of the package, which is the default file name in case of output filename was not specified through the CLI.

#### _MULTIPLE_FILES_

When using `MULTIPLE_FILES`, you need to specify a template for each available compilation context (refer to `templates` section for the list of available contexts).

You also need to specify the `filesExtension` for the generated files.

### templates

`templates` field should contains an object, where the key is the name of the template, and the value is a string.

There are special context types for templates, and each type of templates will compile with a different context:

- `index`: use with `SINGLE_FILE` to declare the main entry point of the generated file, compiled with a merged object, containing all [`SchemaTemplateContext`](../../graphql-codegen-core/src/types.ts#L78-L94) and [`Document`](../../graphql-codegen-core/src/types.ts#L170-L175) fields.
- `type`: use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `type`, this template will compile with _each_ [type](../../graphql-codegen-core/src/types.ts#L38-L46) in your schema.
- `inputType`: use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `input`, this template will compile with _each_ [input type](../../graphql-codegen-core/src/types.ts#L38-L46) in your schema.
- `union`: use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `union`, this template will compile with _each_ [union](../../graphql-codegen-core/src/types.ts#L65-L69) in your schema.
- `scalar`: use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `scalar`, this template will compile with _each_ [scalar](../../graphql-codegen-core/src/types.ts#L48-L51) in your schema.
- `enum`: use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `enum`, this template will compile with _each_ [enum](../../graphql-codegen-core/src/types.ts#L53-L57) in your schema.
- `interface`: use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `interface`, this template will compile with _each_ [interface](../../graphql-codegen-core/src/types.ts#L71-L76) in your schema.
- `operation`: use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL operation (`query`/`mutation`/`subsription`), this template will compile with [`Operation` context](../../graphql-codegen-core/src/types.ts#L151-L161).
- `fragment`: use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL `fragment`, this template will compile with [`Fragment` context](../../graphql-codegen-core/src/types.ts#L144-L149).
- `schema`: use with `MULTIPLE_FILES` to compile with [`SchemaTemplateContext`](../../graphql-codegen-core/src/types.ts#L78-L94).
- `documents`: use with `MULTIPLE_FILES` to compile with all operations, the context will be [`Document`](../../graphql-codegen-core/src/types.ts#L170-L175).
- `all`: same as to `index`.

Also, all templates specified under `templates` will be loaded as Handlebars template partials, so you can use it any time inside other templates, for example, the following templates definitions:

```typescript
const config = {
  // ...
  templates: {
    index: '{{>selectionSet}}',
    selectionSet: 'Hello'
  }
  // ...
};
```

The `index` template loads `selectionSet` template, and it can also provide a context for the specific partial:

```typescript
const config = {
  // ...
  templates: {
    index: '{{>selectionSet types}}',
    selectionSet: '{{#each this }} Type name: {{ name }}{{/each}}'
  }
  // ...
};
```

> You can also load a template from itself, and create a recursive generation of the template.

### flattenTypes

Type flattening is a useful feature when generation a template, when `true` is specified, the generator will return a flatten version of the GraphQL selection set when using inner types.

For example, let's take a look in the following GraphQL schema and `query`:

```graphql schema
type NameFields {
  firstName: String
  lastName: String
}

type User {
  name: NameFields
  email: String
  age: Int
}

type Query {
  me: User
}

schema {
  query: Query
}
```

```graphql
query myQuery {
  user {
    me {
      firstName
      lastName
    }
  }
}
```

This query uses multiple levels of selection set (`user` > `name` > `firstName`), but when adding `flattenTypes: true`, the generator will append a new field to the operation/fragment context, called `innerModels`, and it this case it will contains the following:

```
[
    {
        schemaBaseType: 'User',
        modelType: 'Me',
        fields: [ ... ] // Original SelectionSetFieldNode from the operation
        // .. more fields
    },
    {
        schemaBaseType: 'NameFields',
        modelType: 'Name',
        fields: [ ... ] // Original SelectionSetFieldNode from the operation
        // .. more fields
    }
]
```

So the two available levels of selection set were flatten into a single level, so you can generate you whole selection set in a single iteration.

The `modelType` becomes the name of the selection set field, because we use only part of the available fields (for example, the query only asks for part of the `User` fields), so we can't use the actual GraphQL `type` from the schema - so each selection set creates new "types", and the usage in the selection set also changes, so the `type` of `me` is not `User` - it's `Me`.

The actual compilation context when using `flattenTypes: true` is [available here](../../graphql-codegen-compiler/src/types.ts#L11-L37).

### primitives

Specify `primitives` object map to replace the original GraphQL built-in types to a language-specific primitives.

For example, GraphQL type of `String` is actually a `string` in TypeScript.

### outFile

Use with `SINGLE_FILE`, specify the default filename for the generated file.

### filesExtension

Use with `MULTIPLE_FILES`, specify the file extension for the generated files.

### customHelpers

With `customHelpers` you can add custom helpers that executes with your custom templates.

Provide an object with `key` as the name of the helper, and a `Function` for the helper execution. you can also specify a path to a local JavaScript file.
