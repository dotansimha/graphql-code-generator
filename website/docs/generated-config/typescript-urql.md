This plugin generates `urql` (https://github.com/FormidableLabs/urql) components and HOC with TypeScript typings.

## Installation



<img alt="typescript-urql plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/typescript-urql?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/typescript-urql
:::

## API Reference

### `withComponent`

type: `boolean`
default: `false`

Customized the output by enabling/disabling the generated Component.


### `withHooks`

type: `boolean`
default: `true`

Customized the output by enabling/disabling the generated React Hooks.


### `urqlImportFrom`

type: `string`
default: `urql`

You can specify module that exports components `Query`, `Mutation`, `Subscription` and HOCs
This is useful for further abstraction of some common tasks (eg. error handling).
Filepath relative to generated file can be also specified.


### `noGraphQLTag`

type: `boolean`
default: `false`

Deprecated. Changes the documentMode to `documentNode`.


### `gqlImport`

type: `string`
default: `graphql-tag#gql`

Customize from which module will `gql` be imported from.
This is useful if you want to use modules other than `graphql-tag`, e.g. `graphql.macro`.

#### Usage Examples

##### graphql.macro
```yml
config:
  gqlImport: graphql.macro#gql
```

##### Gatsby
```yml
config:
  gqlImport: gatsby#graphql
```

### `documentNodeImport`

type: `string`
default: `graphql#DocumentNode`

Customize from which module will `DocumentNode` be imported from.
This is useful if you want to use modules other than `graphql`, e.g. `@graphql-typed-document-node`.


### `noExport`

type: `boolean`
default: `false`

Set this configuration to `true` if you wish to tell codegen to generate code with no `export` identifier.


### `dedupeOperationSuffix`

type: `boolean`
default: `false`

Set this configuration to `true` if you wish to make sure to remove duplicate operation name suffix.


### `omitOperationSuffix`

type: `boolean`
default: `false`

Set this configuration to `true` if you wish to disable auto add suffix of operation name, like `Query`, `Mutation`, `Subscription`, `Fragment`.


### `operationResultSuffix`

type: `string`
default: ``

Adds a suffix to generated operation result type names


### `documentVariablePrefix`

type: `string`
default: ``

Changes the GraphQL operations variables prefix.


### `documentVariableSuffix`

type: `string`
default: `Document`

Changes the GraphQL operations variables suffix.


### `fragmentVariablePrefix`

type: `string`
default: ``

Changes the GraphQL fragments variables prefix.


### `fragmentVariableSuffix`

type: `string`
default: `FragmentDoc`

Changes the GraphQL fragments variables suffix.


### `documentMode`

type: `DocumentMode`
default: `graphQLTag`

Declares how DocumentNode are created:
- `graphQLTag`: `graphql-tag` or other modules (check `gqlImport`) will be used to generate document nodes. If this is used, document nodes are generated on client side i.e. the module used to generate this will be shipped to the client
- `documentNode`: document nodes will be generated as objects when we generate the templates.
- `documentNodeImportFragments`: Similar to documentNode except it imports external fragments instead of embedding them.
- `external`: document nodes are imported from an external file. To be used with `importDocumentNodeExternallyFrom`

Note that some plugins (like `typescript-graphql-request`) also supports `string` for this parameter.


### `optimizeDocumentNode`

type: `boolean`
default: `true`

If you are using `documentNode: documentMode | documentNodeImportFragments`, you can set this to `true` to apply document optimizations for your GraphQL document.
This will remove all "loc" and "description" fields from the compiled document, and will remove all empty arrays (such as `directives`, `arguments` and `variableDefinitions`).


### `importOperationTypesFrom`

type: `string`
default: ``

This config is used internally by presets, but you can use it manually to tell codegen to prefix all base types that it's using.
This is useful if you wish to generate base types from `typescript-operations` plugin into a different file, and import it from there.


### `importDocumentNodeExternallyFrom`

type: `string`
default: ``

This config should be used if `documentMode` is `external`. This has 2 usage:
- any string: This would be the path to import document nodes from. This can be used if we want to manually create the document nodes e.g. Use `graphql-tag` in a separate file and export the generated document
- 'near-operation-file': This is a special mode that is intended to be used with `near-operation-file` preset to import document nodes from those files. If these files are `.graphql` files, we make use of webpack loader.

#### Usage Examples

```yml
config:
  documentMode: external
  importDocumentNodeExternallyFrom: path/to/document-node-file
```

```yml
config:
  documentMode: external
  importDocumentNodeExternallyFrom: near-operation-file
```

### `pureMagicComment`

type: `boolean`
default: `false`

This config adds PURE magic comment to the static variables to enforce treeshaking for your bundler.


### `experimentalFragmentVariables`

type: `boolean`
default: `false`

If set to true, it will enable support for parsing variables on fragments.


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
