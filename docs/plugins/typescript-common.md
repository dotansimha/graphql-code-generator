---
id: typescript-common
title: TypeScript Common
---

This is the most basic TypeScript plugin and it can generate typings which can be used both in client and server, given a GraphQL schema.

It generated types for enums, scalars and input types - because those are relevant for both client-side and server-side.

## Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-typescript-common

### Examples

- [Star Wars Schema](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/star-wars/types.d.ts#L0)

## Configuration

The output of this plugin can be controlled using a specified config file which consists of the fields below. Each config field is followed by its matching environment variable, which can be used as an alternative method to control the template's behavior:

#### `namingConvention` (default value: `pascalCase`)

You can override the naming conversion by pointing to a specific function in a module or file (for example: `change-case#lowerCase`).

This will effect all the name conversions of the module.

#### `disableEnumNamingConvention` (default value: `false`)

Set this option to `true` to make enum values follow the naming convention of the source, as opposed to being converted to the `namingConvention` specified above.

#### `scalars`

Will map scalars to the predefined types.

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - typescript-common
    config:
      scalars:
        Date: Date
]
```

> You can also override built-in scalars, such as `String`.

#### `avoidOptionals` (default value: `false`)

This will cause the generator to avoid using TypeScript optionals (`?`), so the following definition: `type A { myField: String }` will output `myField: string | null` instead of `myField?: string | null`.

#### `enumsAsTypes` (default value: `false`)

Will generate the declared enums as TypeScript types. This is useful if you can't use `.ts` extension.

#### `immutableTypes` (default value: `false`)

This will cause the codegen to output `readonly` properties and `ReadonlyArray`.

#### `schemaNamespace` (default value: `false`)

This will cause the codegen to wrap the generated schema typings with a TypeScript namespace.

#### `interfacePrefix` (default value: '')

This will cause the codegen to prefix graphql type interfaces with the given value (if `I` is defined as prefix, type `Foo` will be generated as an interface named `IFoo`). Use this flag if you would like to run the codegen on multiple schemas. Note that even though we run this command on multiple schemas, the output types will be merged and not separated. For more information regards declaration merging, see [reference](https://www.typescriptlang.org/docs/handbook/declaration-merging.html).

## Custom Scalars Types with `add` Plugin

`scalars` option can be combined to map custom types to scalars, but in order to use it, you need to use the [add](/docs/plugins/add) plugin, and inject your custom imports to the output file:

```yaml
# ...
generates:
  path/to/file.ts:
    - add:
        - import { CustomScalarType } from './custom-types';
        - import { AnotherCustomScalarType } from './another-custom-types';
    - typescript-common:
        scalars:
          CustomScalar: CustomScalarType
          AnotherCustomScalar: AnotherCustomScalarType
```
