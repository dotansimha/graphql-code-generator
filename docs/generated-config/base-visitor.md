
### scalars (`ScalarsMap`)

Extends or overrides the built-in scalars and custom GraphQL scalars to a custom type.


#### Usage Example

```yml
config:
  scalars:
    DateTime: Date
    JSON: { [key: string]: any }
```

### namingConvention (`NamingConvention`, default value: `pascal-case#pascalCase`)

Allow you to override the naming convention of the output. You can either override all namings, or specify an object with specific custom naming convention per output. The format of the converter must be a valid `module#method`. Allowed values for specific output are: `typeNames`, `enumValues`. You can also use "keep" to keep all GraphQL names as-is. Additionally you can set `transformUnderscore` to `true` if you want to override the default behaviour, which is to preserves underscores.


#### Usage Example: Override All Names

```yml
config:
  namingConvention: lower-case#lowerCase
```
#### Usage Example: Upper-case enum values

```yml
config:
  namingConvention:
    typeNames: pascal-case#pascalCase
    enumValues: upper-case#upperCase
```
#### Usage Example: Keep

```yml
config:
  namingConvention: keep
```
#### Usage Example: Remove Underscores

```yml
config:
  namingConvention:
    typeNames: pascal-case#pascalCase
    transformUnderscore: true
```

### typesPrefix (`string`, default value: `""`)

Prefixes all the generated types.


#### Usage Example: Add "I" Prefix

```yml
config:
  typesPrefix: I
```

### skipTypename (`boolean`, default value: `false`)

Does not add __typename to the generated types, unless it was specified in the selection set. in the selection set.


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