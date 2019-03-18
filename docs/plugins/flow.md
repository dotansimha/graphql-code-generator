---
id: flow
title: Flow Types
---

The `@graphql-codegen/flow` plugin generates Flow types based on your `GraphQLSchema`.

It generates types for your entire schema: types, input types, enum, interface, scalar and union.

## Installation

Install using `npm` (or `yarn`):

    $ npm install @graphql-codegen/flow

### Examples

- [Basic Schema Example](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/test-schema/flow-types.flow.js)

## Configuration

The output of this plugin can be controlled using a specified config file which consists of the fields below.

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

#### `enumValues` (default value: `{}`)

Use this feature to set custom values for you GraphQL enums.

```yaml
# ...
generates:
  path/to/file.flow.js:
    plugins:
      - flow
    config:
      enumValues:
        MyEnum:
          A: 'foo'
```

#### `useFlowExactObjects`

Use this feature to get [exact typed](https://flow.org/en/docs/types/objects/#toc-exact-object-types) values.

```yaml
# ...
generates:
  path/to/file.flow.js:
    plugins:
      - flow
    config:
      useFlowExactObject: true
```

##### output

```
# ...
type Person (|
  name?: string,
  age?: number,
|);
```

#### `useFlowReadOnlyTypes`

Use this feature to get [read-only](https://flow.org/en/docs/types/utilities/#toc-readonly) typed values.

```yaml
# ...
generates:
  path/to/file.flow.js:
    plugins:
      - flow
    config:
      useFlowReadOnlyTypes: true
```

##### output

```
# ...
type Person (
  +name?: string,
  +age?: number,
);
```

## Custom Scalars Types with `add` Plugin

`scalars` option can be combined to map custom types to scalars, but in order to use it, you need to use the [add](/docs/plugins/add) plugin, and inject your custom imports to the output file:

```yaml
# ...
generates:
  path/to/file.flow.js:
    - add:
        - import { CustomScalarType } from './custom-types';
        - import { AnotherCustomScalarType } from './another-custom-types';
    - flow:
        scalars:
          CustomScalar: CustomScalarType
          AnotherCustomScalar: AnotherCustomScalarType
```
