### scalars (`ScalarsMap`)

Extends or overrides the built-in scalars and custom GraphQL scalars to a custom type.

#### Usage Example

```yml
config:
  scalars:
    DateTime: Date
    JSON: { [key: string]: any }
```

### namingConvention (`NamingConvention`, default value: `change-case#pascalCase`)

Allow you to override the naming convention of the output. You can either override all namings, or specify an object with specific custom naming convention per output. The format of the converter must be a valid `module#method`. Allowed values for specific output are: `typeNames`, `enumValues`. You can also use "keep" to keep all GraphQL names as-is.

Additionally, the codegen keeps underscore (`_`) for type names, but removes them for enum values. If you wish to keep underscore in your enum values, you can add `transformUnderscore: false` to your configuration.

#### Usage Example: Override All Names

```yml
config:
  namingConvention: change-case#lowerCase
```

#### Usage Example: Upper-case enum values

```yml
config:
  namingConvention:
    typeNames: change-case#pascalCase
    enumValues: change-case#upperCase
```

#### Usage Example: Keep Names As-Is

```yml
config:
  namingConvention: keep
```

#### Usage Example: Keep Underscores

```yml
config:
  namingConvention:
    transformUnderscore: false
```

### typesPrefix (`string`, default value: `""`)

Prefixes all the generated types.

#### Usage Example: Add "I" Prefix

```yml
config:
  typesPrefix: I
```

### skipTypename (`boolean`, default value: `false`)

Automatically adds `__typename` field to the generated types, even when they are not specified in the selection set.

#### Usage Example

```yml
config:
  skipTypename: true
```

### nonOptionalTypename (`boolean`, default value: `false`)

Automatically adds `__typename` field to the generated types, even when they are not specified in the selection set, and makes it non-optional

#### Usage Example

```yml
config:
  nonOptionalTypename: true
```
