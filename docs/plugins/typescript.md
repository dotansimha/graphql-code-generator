---
id: typescript
title: TypeScrip
---

This is the most basic TypeScript plugin and it can generate typings based on `GraphQLSchema`, which can be used by any other typescript related plugin.

It generates types for your entire schema: types, input types, enums, interfaces, scalars and unions.

## Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-typescript

### Examples

- [Star Wars Schema](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/star-wars/types.d.ts#L0)

## Configuration

The output of this plugin can be controlled using a specified config file which consists of the fields below.

#### `namingConvention` (default value: `pascalCase`)

You can override the naming conversion by pointing to a specific function in a module or file (for example: `change-case#lowerCase`).

This will effect all the name conversions of the module.

You can either specify a string pointing to a method in a module (or a file) in order to apply it to all names:

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - typescript
    config:
      namingConvention: change-case#lowerCase
```

Or, an object with a method per output type (the allowed values are `enumValues` and `typeNames`):

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - typescript
    config:
      namingConvention:
        typeNames: change-case#pascalCase
        enumValues: change-case#upperCase
```

> The example above will use `pascalCase` for most cases, and `upperCase` for the enum values.

#### `scalars`

Will map scalars to the predefined types.

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - typescript
    config:
      scalars:
        Date: Date
```

> You can also override built-in scalars, such as `String`.

#### `avoidOptionals` (default value: `false`)

This will cause the generator to avoid using TypeScript optionals (`?`), so the following definition: `type A { myField: String }` will output `myField: string | null` instead of `myField?: string | null`.

#### `enumsAsTypes` (default value: `false`)

Will generate the declared enums as TypeScript types. This is useful if you can't use `.ts` extension.

#### `enums` (default value: `{}`)

Use this feature to set custom values for your GraphQL enums, reuse an existing enum, or skip generation entirely.

##### Custom values:

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - typescript
    config:
      enums:
        MyEnum:
          A: 'foo'
```

##### Existing enum:

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - typescript
    config:
      enums:
        MyEnum: ./path/to/enum#MyEnum
```

Note:

- The file path is relative to the generated output file.
- Another type named `MyEnumValueMap` will also be generated which allows you to map the GraphQL API enum values to internal values if needed.
- This option supercedes `enumsAsTypes` for this enum.

##### Skip generation:

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - typescript
    config:
      enums:
        MyEnum: # empty
```

Note:

- No `MyEnum` type will be generated at all, and you can use the `add` plugin to manually define or import it.
- This option supercedes `enumsAsTypes` for this enum.

#### `immutableTypes` (default value: `false`)

This will cause the codegen to output `readonly` properties and `ReadonlyArray`.

#### `typesPrefix` (default value: '')

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
