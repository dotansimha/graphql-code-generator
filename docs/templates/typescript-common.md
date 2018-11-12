---
id: typescript-common
title: TypeScript Common
---

This is the most basic TypeScript template and it can generate typings which can be used both in client and server, given a GraphQL schema.

## Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-typescript-common

## Configuration

The output of this template can be controlled using a specified config file which consists of the fields below. Each config field is followed by its matching environment variable, which can be used as an alternative method to control the template's behavior:

#### `printTime`, `CODEGEN_PRINT_TIME` (default value: `false`)

Add the generation time to the top of the generated file.

#### `prepend` (default value: `null`)

Add the specified lines of code to the top of the generated file.

```json
prepend: [
    "// My Comment",
    "// My Other Comment"
]
```

#### `scalars` (default value: `null`)

Will map scalars to the predefined types.

```json
    scalars: {
        "Date": "Date"
    }
```

#### Combination of `prepend` and `scalars`

`prepend` and `scalars` options can be combined to map custom types to scalars.

```json
    prepend: [
        "import { CustomScalarType } from './custom-types';"
        "import { AnotherCustomScalarType } from './another-custom-types';"
    ],
    scalars: {
        "CustomScalar": "CustomScalarType",
        "AnotherCustomScalar": "AnotherCustomScalarType"
    }
```

#### `avoidOptionals`, `CODEGEN_AVOID_OPTIONALS` (default value: `false`)

This will cause the generator to avoid using TypeScript optionals (`?`), so the following definition: `type A { myField: String }` will output `myField: string | null` instead of `myField?: string | null`.

#### `enumsAsTypes`, `CODEGEN_ENUMS_AS_TYPES` (default value: `false`)

Will generate the declared enums as TypeScript types. This is useful if you can't use `.ts` extension.

#### `immutableTypes`, `CODEGEN_IMMUTABLE_TYPES` (default value: `false`)

This will cause the codegen to output `readonly` properties and `ReadonlyArray`.

#### `resolvers`, `CODEGEN_RESOLVERS` (default value: `true`)

This will cause the codegen to output types for resolvers.

#### `noNamespaces`, `CODEGEN_SCHEMA_NO_NAMESPACES` (default value: `null`)

This will cause the codegen not to use `namespace` in typings.

#### `schemaNamespace`, `CODEGEN_SCHEMA_NAMESPACE` (default value: `null`)

This will cause the codegen to wrap the generated schema typings with a TypeScript namespace.

#### `interfacePrefix`, `CODEGEN_INTERFACE_PREFIX` (default value: `null`)

This will cause the codegen to prefix graphql type interfaces with the given value (if `I` is defined as prefix, type `Foo` will be generated as an interface named `IFoo`). Use this flag if you would like to run the codegen on multiple schemas. Note that even though we run this command on multiple schemas, the output types will be merged and not separated. For more information regards declaration merging, see [reference](https://www.typescriptlang.org/docs/handbook/declaration-merging.html).
