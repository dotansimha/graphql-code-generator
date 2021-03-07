This plugin and presets creates generated mappers and parsers for a complete type-safe GraphQL requests, for developers that uses Apollo Android runtime.

## Installation



<img alt="java-apollo-android plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/java-apollo-android?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/java-apollo-android
:::

## API Reference

### `package`

type: `string`

Customize the Java package name for the generated operations. The default package name will be generated according to the output file path.

#### Usage Examples

```yml
generates:
./app/src/main/java/:
  preset: java-apollo-android
  config:
    package: "com.my.package.generated.graphql"
  plugins:
    - java-apollo-android
```

### `typePackage`

type: `string`

Customize the Java package name for the types generated based on input types.

#### Usage Examples

```yml
generates:
./app/src/main/java/:
  preset: java-apollo-android
  config:
    typePackage: "com.my.package.generated.graphql"
  plugins:
    - java-apollo-android
```

### `fragmentPackage`

type: `string`

Customize the Java package name for the fragments generated classes.

#### Usage Examples

```yml
generates:
./app/src/main/java/:
  preset: java-apollo-android
  config:
    fragmentPackage: "com.my.package.generated.graphql"
  plugins:
    - java-apollo-android
```

### `fileType`

type: `FileType`



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
