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

Allow you to override the naming convention of the output. You can either override all namings, or specify an object with specific custom naming convention per output. The format of the converter must be a valid `module#method`. Allowed values for specific output are: `typeNames`, `enumValues`. You can also use "keep" to keep all GraphQL names as-is. Additionally you can set `transformUnderscore` to `true` if you want to override the default behaviour, which is to preserver underscores.

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

#### Usage Example: Keep

```yml
config:
  namingConvention: keep
```

#### Usage Example: Transform Underscores

```yml
config:
  typeNames: change-case#pascalCase
  transformUnderscore: true
```

### typesPrefix (`string`, default value: `""`)

Prefixes all the generated types.

#### Usage Example: Add "I" Prefix

```yml
config:
  typesPrefix: I
```
