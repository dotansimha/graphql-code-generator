---
id: package
title: Writing a Template NPM Package
---

Nothing actually really stops you from writing a custom template NPM package yourself, but we've decided to ease stuff on you. We've created a CLI tool called `codegen-templates-scripts` will download and setup a boilerplate for your package.

To get started, install the CLI:

    $ npm install codegen-templates-scripts -g

Create a new directory which will contain the NPM package:

    $ mkdir my-codegen-template

And initialize it by running the following:

    my-codegen-template$ codegen-templates-scripts init

> ⚠ Use the `--override` flag to override existing files like `package.json`.

Now you can go ahead and start implementing your template under the `src/` folder and tweak the [`config.ts` file](#config) accordingly.

## Testing your template locally

To test your template locally, you can either test it on a real project using the `--template` option with the path to your template directory (and make sure to build it with `$ npm run build` beforehand). You can also take a look at the examples unit tests which are shipped by default with the boiler plate and run them with the `$ npm run test` command.

## config.ts

This file contains the configuration and declaration settings of your package, and it supports the following fields:

### inputType

The entire behavior of the generator will be changed according to the input type. Allowed values are `SINGLE_FILE` and `MULTIPLE_FILES`.

- **SINGLE_FILE** - This will tell the generator that there's a single entry point for the template and it will be invoked with the `all` compilation context (see [all contexts](#templates)). When using this input type you will need to specify the entry point for the template using the `config.index` field, and the default relative output file path in case no `--out` option was provided, using the `config.outFile` field.
- **MULTIPLE_FILES** - This will tell the generator that the template is composed out of multiple files. When using this input type you will have to set the [`config.templates`](#) and [`config.filesExtension`](#filesextension) fields.

### templates

An object which will map template names to their GraphQL AST node type that they're supposed to handle. Each node type handler will be provided with a different compilation context, which is a set of models which contains information regards the node which is currently being compiled. All possible node types and their compilation contexts are listed below:

- `index` - use with `SINGLE_FILE` to declare the main entry point of the generated file, compiled with a merged object, containing all [`SchemaTemplateContext`](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts) and [`Document`](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L232) fields.
- `type` - use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `type`, this template will compile with _each_ [type](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L56) in your schema.
- `inputType` - use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `input`, this template will compile with _each_ [input type](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L270) in your schema.
- `union` - use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `union`, this template will compile with _each_ [union](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L83) in your schema.
- `scalar` - use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `scalar`, this template will compile with _each_ [scalar](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L66) in your schema.
- `enum` - use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `enum`, this template will compile with _each_ [enum](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L71) in your schema.
- `interface` - use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL schema `interface`, this template will compile with _each_ [interface](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L89) in your schema.
- `operation` - use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL operation (`query`/`mutation`/`subsription`), this template will compile with [`Operation` context](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L188).
- `fragment` - use with `MULTIPLE_FILES` to declare that this template belongs to GraphQL `fragment`, this template will compile with [`Fragment` context](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L123).
- `schema` - use with `MULTIPLE_FILES` to compile with [`SchemaTemplateContext`](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts).
- `documents` - use with `MULTIPLE_FILES` to compile with all operations, the context will be [`Document`](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L232).
- `all` - same as to `index`.

Also, all templates specified under `config.templates` will be loaded as Handlebars template partials, so you can use it any time inside other templates, like the following:

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

In the example above the `index` template loads the `selectionSet` template partial. You can also provide a compilation context for template partial like the following:

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

A template can also use itself as a partial and be compiled recursively.

### flattenTypes

If `true`, the generator will return a flatten version of the GraphQL selection set when using inner types.

For example, let's take a look in the following GraphQL schema and `myQuery`:

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

`myQuery` uses multiple levels of selection set (`user` > `name` > `firstName`), but when adding `flattenTypes: true`, the generator will append a new field to the operation/fragment context, called `innerModels`, which will result in the following object:

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

No that we have a flat object, we don't need to go deeper as we process the data which will make the template compilation a lot easier. The compilation context used when `flattenTypes` is set to `true` is [available here](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L116).

### primitives

Specify `primitives` object map to replace the original GraphQL built-in types to language-specific primitives. For example, GraphQL `String` type will be mapped to `string` type in TypeScript.

### outFile

If `inputType` is set to `SINGLE_FILE`, this field will specify the output path of the compiled template in case a `--out` option wasn't provided to `gql-gen`.

### filesExtension

If `inputType` is set to `MULTIPLE_FILES`, this filed will specify the file the file extension of the generated files, e.g. `.ts`.

### customHelpers

An object to define custom [Handlebars block helpers](https://handlebarsjs.com/block_helpers.html). The key represents the name of the helper and the value represents the handler function for the helper. You can also specify a path to a file that will export the mapping object.
