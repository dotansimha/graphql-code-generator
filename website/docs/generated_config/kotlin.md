## Installation



<img alt="kotlin plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/kotlin?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/kotlin
:::

## API Reference

### `package`

type: `string`

Customize the Java package name. The default package name will be generated according to the output file path.

#### Usage Examples

```yml
generates:
  src/main/kotlin/my-org/my-app/Resolvers.kt:
    plugins:
      - kotlin
    config:
      package: custom.package.name
```

### `enumValues`

type: `EnumValuesMap`

Overrides the default value of enum values declared in your GraphQL schema.


### `listType`

type: `string`
default: `Iterable`

Allow you to customize the list type

#### Usage Examples

```yml
generates:
  src/main/kotlin/my-org/my-app/Types.kt:
    plugins:
      - kotlin
    config:
      listType: Map
```

### `withTypes`

type: `boolean`
default: `false`

Allow you to enable generation for the types

#### Usage Examples

```yml
generates:
  src/main/kotlin/my-org/my-app/Types.kt:
    plugins:
      - kotlin
    config:
      withTypes: true
```

### `strictScalars`

type: `boolean`
default: `false`

Makes scalars strict.

If scalars are found in the schema that are not defined in `scalars`
an error will be thrown during codegen.

#### Usage Examples

```yml
config:
  strictScalars: true
```

### `defaultScalarType`

type: `string`
default: `any`

Allows you to override the type that unknown scalars will have.

#### Usage Examples

```yml
config:
  defaultScalarType: unknown
```

### `scalars`

type: `ScalarsMap`

Extends or overrides the built-in scalars and custom GraphQL scalars to a custom type.


### `namingConvention`

type: `NamingConvention`
default: `change-case-all#pascalCase`

Allow you to override the naming convention of the output.
You can either override all namings, or specify an object with specific custom naming convention per output.
The format of the converter must be a valid `module#method`.
Allowed values for specific output are: `typeNames`, `enumValues`.
You can also use "keep" to keep all GraphQL names as-is.
Additionally you can set `transformUnderscore` to `true` if you want to override the default behavior,
which is to preserves underscores.

Available case functions in `change-case-all` are `camelCase`, `capitalCase`, `constantCase`, `dotCase`, `headerCase`, `noCase`, `paramCase`, `pascalCase`, `pathCase`, `sentenceCase`, `snakeCase`, `lowerCase`, `localeLowerCase`, `lowerCaseFirst`, `spongeCase`, `titleCase`, `upperCase`, `localeUpperCase` and `upperCaseFirst`
[See more](https://github.com/btxtiger/change-case-all)


### `typesPrefix`

type: `string`
default: ``

Prefixes all the generated types.

#### Usage Examples

```yml
config:
  typesPrefix: I
```

### `typesSuffix`

type: `string`
default: ``

Suffixes all the generated types.

#### Usage Examples

```yml
config:
  typesSuffix: I
```

### `skipTypename`

type: `boolean`
default: `false`

Does not add __typename to the generated types, unless it was specified in the selection set.

#### Usage Examples

```yml
config:
  skipTypename: true
```

### `nonOptionalTypename`

type: `boolean`
default: `false`

Automatically adds `__typename` field to the generated types, even when they are not specified
in the selection set, and makes it non-optional

#### Usage Examples

```yml
config:
  nonOptionalTypename: true
```

### `useTypeImports`

type: `boolean`
default: `false`

Will use `import type {}` rather than `import {}` when importing only types. This gives
compatibility with TypeScript's "importsNotUsedAsValues": "error" option


### `dedupeFragments`

type: `boolean`
default: `false`

Removes fragment duplicates for reducing data transfer.
It is done by removing sub-fragments imports from fragment definition
Instead - all of them are imported to the Operation node.


### `inlineFragmentTypes`

type: `InlineFragmentTypeOptions`
default: `inline`

Whether fragment types should be inlined into other operations.
"inline" is the default behavior and will perform deep inlining fragment types within operation type definitions.
"combine" is the previous behavior that uses fragment type references without inlining the types (and might cauuse issues with deeply nested fragment that uses list types).
