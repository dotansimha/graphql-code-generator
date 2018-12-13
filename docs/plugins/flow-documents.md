---
id: flow-documents
title: Flow Documents
---

The `graphql-codegen-flow-documents` plugin generates Flow types based on your `GraphQLSchema` and your GraphQL documents.

It generates types for your GraphQL documents: Query, Mutation, Subscription and Fragment.

This plugin requires you to use `graphql-codegen-flow` as well, because it depends on it's types.

## Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-flow-documents

### Examples

- [GitHunt Example](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/githunt/flow.flow.js#L118)

## Configuration

The output of this plugin can be controlled using a specified config file which consists of the fields below.

#### `skipTypename` (default value: `false`)

Avoid generating `__typename` field for the output types. If you still add `__typename` manually in some selection sets, it will still generate it.

#### `namingConvention` (default value: `pascalCase`)

You can override the naming conversion by pointing to a specific function in a module or file (for example: `change-case#lowerCase`).

This will effect all the name conversions of the module.

#### `scalars`

Will map scalars to the predefined types.

```yaml
# ...
generates:
  path/to/file.flow.js:
    plugins:
      - flow
    config:
      scalars:
        Date: Date
]
```

> You can also override built-in scalars, such as `String`.

#### `typesPrefix` (default value: '')

This will cause the codegen to prefix graphql type interfaces with the given value (if `I` is defined as prefix, type `Foo` will be generated as an interface named `IFoo`).
