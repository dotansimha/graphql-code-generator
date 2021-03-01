This plugin generates C# `class` identifier for your schema types.

## Installation



<img alt="c-sharp plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/c-sharp?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/c-sharp
:::

## API Reference

### `enumValues`

type: `EnumValuesMap`

Overrides the default value of enum values declared in your GraphQL schema.


### `namespaceName`

type: `string`
default: `GraphQLCodeGen`

Allow you to customize the namespace name.

#### Usage Examples

```yml
generates:
  src/main/c-sharp/my-org/my-app/MyTypes.cs:
    plugins:
      - c-sharp
    config:
      namespaceName: MyCompany.MyNamespace
```

### `className`

type: `string`
default: `Types`

Allow you to customize the parent class name.

#### Usage Examples

```yml
generates:
  src/main/c-sharp/my-org/my-app/MyGeneratedTypes.cs:
    plugins:
      - c-sharp
    config:
      className: MyGeneratedTypes
```

### `listType`

type: `string`
default: `IEnumerable`

Allow you to customize the list type

#### Usage Examples

```yml
generates:
  src/main/c-sharp/my-org/my-app/Types.cs:
    plugins:
      - c-sharp
    config:
      listType: Map
```

### `emitRecords`

type: `boolean`
default: `false`

Emit C# 9.0+ records instead of classes

#### Usage Examples

```yml
generates:
  src/main/c-sharp/my-org/my-app/Types.cs:
    plugins:
      - c-sharp
    config:
      emitRecords: true
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
