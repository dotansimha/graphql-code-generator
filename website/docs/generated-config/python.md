This plugin generates the base Python types, based on your GraphQL schema.

This is equivalent of the `typescript` plugin. The generated types are simple, refer to your schema's exact structure, and will be used as the base type for future plugins (such as `python-operations`).

By default, this package only supports Python 3.8+, since that is the first time literal types were introduced. If you do need support for Python 3.5-3.7, you'll need to use the typenameAsString option.

## Installation



<img alt="python plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/python?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/python
:::

## API Reference

### `typenameAsString`

type: `boolean`

Uses `Scalars.String` for typename instead of Literal. It also removes the Literal import. This provides compatibility for Python 3.5-3.7.

#### Usage Examples

##### With Custom Values
```yml
  config:
    typenameAsString: true
```

### `useTypeImports`

type: `boolean`
default: `false`

Will use `import type {}` rather than `import {}` when importing only types. This gives
compatibility with TypeScript's "importsNotUsedAsValues": "error" option


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

### `addUnderscoreToArgsType`

type: `boolean`

Adds `_` to generated `Args` types in order to avoid duplicate identifiers.

#### Usage Examples

##### With Custom Values
```yml
  config:
    addUnderscoreToArgsType: true
```

### `enumValues`

type: `EnumValuesMap`

Overrides the default value of enum values declared in your GraphQL schema.
You can also map the entire enum to an external type by providing a string that of `module#type`.


### `enumPrefix`

type: `boolean`
default: `true`

Allow you to disable prefixing for generated enums, works in combination with `typesPrefix`.

#### Usage Examples

##### Disable enum prefixes
```yml
  config:
    typesPrefix: I
    enumPrefix: false
```

### `onlyOperationTypes`

type: `boolean`
default: `false`

This will cause the generator to emit types for operations only (basically only enums and scalars)

#### Usage Examples

##### Override all definition types
```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   onlyOperationTypes: true
```

### `ignoreEnumValuesFromSchema`

type: `boolean`
default: `false`

This will cause the generator to ignore enum values defined in GraphQLSchema

#### Usage Examples

##### Ignore enum values from schema
```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   ignoreEnumValuesFromSchema: true
```

### `wrapEntireFieldDefinitions`

type: `boolean`
default: `true`

Set the to `true` in order to wrap field definitions with `EntireFieldWrapper`.
This is useful to allow return types such as Promises and functions for fields.
Differs from `wrapFieldDefinitions` in that this wraps the entire field definition if ie. the field is an Array, while
`wrapFieldDefinitions` will wrap every single value inside the array.


### `entireFieldWrapperValue`

type: `string`
default: `T | Promise<T> | (() => T | Promise<T>)`

Allow to override the type value of `EntireFieldWrapper`. This wrapper applies outside of Array and Maybe
unlike `fieldWrapperValue`, that will wrap the inner type.
