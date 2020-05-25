This plugin generates

## Installation

:::shell Using `yarn`

    $ yarn add -D @graphql-codegen/typescript-vue-apollo

:::

## API Reference

### `withCompositionFunctions`

type: `boolean`

default: `true`

Customized the output by enabling/disabling the generated Vue composition functions.

#### Usage Examples

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - typescript-vue-apollo
 config:
   withCompositionFunctions: true
```


### `vueApolloComposableImportFrom`

type: `string`

default: ``





### `addDocBlocks`

type: `boolean`

default: `true`

Allows you to enable/disable the generation of docblocks in generated code.
Some IDE's (like VSCode) add extra inline information with docblocks, you can disable this feature if your preferred IDE does not.

#### Usage Examples

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - typescript-vue-apollo
 config:
   addDocBlocks: true
```


### `noGraphQLTag`

type: `boolean`






### `gqlImport`

type: `string`






### `noExport`

type: `boolean`






### `dedupeOperationSuffix`

type: `boolean`






### `omitOperationSuffix`

type: `boolean`






### `operationResultSuffix`

type: `string`






### `documentVariablePrefix`

type: `string`






### `documentVariableSuffix`

type: `string`






### `fragmentVariablePrefix`

type: `string`






### `fragmentVariableSuffix`

type: `string`






### `documentMode`

type: `DocumentMode`






### `importOperationTypesFrom`

type: `string`






### `importDocumentNodeExternallyFrom`

type: `string`






### `scalars`

type: `ScalarsMap`


Extends or overrides the built-in scalars and custom GraphQL scalars to a custom type.

#### Usage Examples

```yml
config:
  scalars:
    DateTime: Date
    JSON: "{ [key: string]: any }"
```


### `namingConvention`

type: `NamingConvention`

default: `pascal-case#pascalCase`

Allow you to override the naming convention of the output.
You can either override all namings, or specify an object with specific custom naming convention per output.
The format of the converter must be a valid `module#method`.
Allowed values for specific output are: `typeNames`, `enumValues`.
You can also use "keep" to keep all GraphQL names as-is.
Additionally you can set `transformUnderscore` to `true` if you want to override the default behavior,
which is to preserves underscores.

#### Usage Examples

##### Override All Names
```yml
config:
  namingConvention: lower-case#lowerCase
```

##### Upper-case enum values
```yml
config:
  namingConvention:
    typeNames: pascal-case#pascalCase
    enumValues: upper-case#upperCase
```

##### Keep names as is
```yml
config:
  namingConvention: keep
```

##### Remove Underscores
```yml
config:
  namingConvention:
    typeNames: pascal-case#pascalCase
    transformUnderscore: true
```


### `typesPrefix`

type: `string`

default: ``

Prefixes all the generated types.

#### Usage Examples

```yml
config:
  typesPrefix: I
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
