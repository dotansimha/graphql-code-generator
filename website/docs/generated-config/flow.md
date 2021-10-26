This plugin generates Flow types based on your `GraphQLSchema`.

It generates types for your entire schema: types, input types, enum, interface, scalar and union.

## Installation



<img alt="flow plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/flow?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/flow
:::

## API Reference

### `useFlowExactObjects`

type: `boolean`
default: `true`

Generates Flow types as Exact types.

#### Usage Examples

```yml
generates:
  path/to/file.ts:
    plugins:
      - flow
    config:
      useFlowExactObjects: false
```

### `useFlowReadOnlyTypes`

type: `boolean`
default: `false`

Generates read-only Flow types

#### Usage Examples

```yml
generates:
  path/to/file.ts:
   plugins:
     - flow
   config:
     useFlowReadOnlyTypes: true
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


### `declarationKind`

type: `DeclarationKindConfig | string (values: abstract class, class, interface, type)`

Overrides the default output for various GraphQL elements.

#### Usage Examples

##### Override all declarations
```yml
  config:
    declarationKind: 'interface'
```

##### Override only specific declarations
```yml
  config:
    declarationKind:
      type: 'interface'
      input: 'interface'
```

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

### `fieldWrapperValue`

type: `string`
default: `T`

Allow you to add wrapper for field type, use T as the generic value. Make sure to set `wrapFieldDefinitions` to `true` in order to make this flag work.

#### Usage Examples

##### Allow Promise
```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   wrapFieldDefinitions: true
   fieldWrapperValue: T | Promise<T>
```

### `wrapFieldDefinitions`

type: `boolean`
default: `false`

Set the to `true` in order to wrap field definitions with `FieldWrapper`.
This is useful to allow return types such as Promises and functions.

#### Usage Examples

##### Enable wrapping fields
```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   wrapFieldDefinitions: true
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


### `directiveArgumentAndInputFieldMappings`

type: `DirectiveArgumentAndInputFieldMappings`

Replaces a GraphQL scalar with a custom type based on the applied directive on an argument or input field.

You can use both `module#type` and `module#namespace#type` syntax.
Will NOT work with introspected schemas since directives are not exported.
Only works with directives on ARGUMENT_DEFINITION or INPUT_FIELD_DEFINITION.

**WARNING:** Using this option does only change the type definitions.

For actually ensuring that a type is correct at runtime you will have to use schema transforms (e.g. with [@graphql-tools/utils mapSchema](https://www.graphql-tools.com/docs/schema-directives)) that apply those rules!
Otherwise, you might end up with a runtime type mismatch which could cause unnoticed bugs or runtime errors.

Please use this configuration option with care!


### `directiveArgumentAndInputFieldMappingTypeSuffix`

type: `string`

Adds a suffix to the imported names to prevent name clashes.

#### Usage Examples

```yml
plugins:
  config:
    directiveArgumentAndInputFieldMappingTypeSuffix: Model
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
