---
id: flow-resolvers
title: Flow Resolvers
---

The `graphql-codegen-flow-resolvers` plugin generates resolvers signature based on your `GraphQLSchema`.

It generates types for your entire schema: types, input types, enum, interface, scalar and union.

This plugin requires you to use `graphql-codegen-flow` as well, because it depends on it's types.

## Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-flow-resolvers

### Examples

- [Basic Schema Example](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/test-schema/flow-types.flow.js)

## Configuration

The output of this plugin can be controlled using a specified config file which consists of the fields below.

#### `contextType` (default value: `any`)

Use this configuration to set a custom type for your `context`, and it will effect all the resolvers, without the need to override it using generics each time.

If you wish to use an external type and import it from another file, you can use `add` plugin and add the required `import`.

#### `mapping` (default value: `{}`)

Use this configuration to override specific types with your own types, without the need to do it each time using generics.

```yaml
# ...
generates:
  path/to/file.flow.js:
    plugins:
      - add: "import { MyTypeCustomInterface } from './my-types';"
      - flow
      - flow-resolvers
    config:
      mapping:
        MyType: MyTypeCustomInterface
```

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
```

> You can also override built-in scalars, such as `String`.

#### `typesPrefix` (default value: '')

This will cause the codegen to prefix graphql type interfaces with the given value (if `I` is defined as prefix, type `Foo` will be generated as an interface named `IFoo`).
