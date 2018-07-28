# TypeScript template

This template generates TypeScript typings for both client side and server side.

## Generator Config

This generator supports custom config and output behavior. Use to following flags/environment variables to modify your output as you wish:

### `printTime` (or `CODEGEN_PRINT_TIME`, default value: `false`)

Setting this to true will cause the generator to add the time of the generated output on top of the file.

### `prepend` ( default value: `null` )

Will add the elements of this on top of the file.

```json
    prepend: [
        "// My Comment",
        "// My Other Comment"
    ]
```

### `scalars` ( default value: `null` )

Will map scalars to the predefined types

```json
    scalars: {
        "Date": "Date"
    }
```

### Combination of `prepend` and `scalars`

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

### `avoidOptionals` (or `CODEGEN_AVOID_OPTIONALS`, default value: `false`)

This will cause the generator to avoid using TypeScript optionals (`?`), so the following definition: `type A { myField: String }` will output `myField: string | null` instead of `myField?: string | null`.

### `enumsAsTypes` (or `CODEGEN_ENUMS_AS_TYPES`, default value: `false`)

Will generate the declared enums as TypeScript `type` instead of `enums`. This is useful if you can't use `.ts` extension.

### `immutableTypes` (or `CODEGEN_IMMUTABLE_TYPES`, default value: `false`)

This will cause the codegen to output `readonly` properties and `ReadonlyArray`.

### `resolvers` (or `CODEGEN_RESOLVERS`, default value: `true`)

This will cause the codegen to output types for resolvers.

### `noNamespaces` (or `CODEGEN_SCHEMA_NO_NAMESPACES`, default value: `null`)

This will cause the codegen not to use `namespace` in typings

### `schemaNamespace` (or `CODEGEN_SCHEMA_NAMESPACE`, default value: `null`)

This will cause the codegen to wrap the generated schema typings with a TypeScript namespace.

### `interfacePrefix` (or `CODEGEN_INTERFACE_PREFIX`, default value: `null`)

This will cause the codegen to prefix graphql type interfaces with a value (if `I` is defined as prefix, type `Foo` will be generated as an interface named `IFoo`)

Use this feature if you need to run the codegen on multiple schemas, but getting a unified types (read more [here](https://www.typescriptlang.org/docs/handbook/declaration-merging.html))
