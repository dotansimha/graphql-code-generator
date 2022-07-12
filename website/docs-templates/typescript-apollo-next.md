---
id: typescript-apollo-next
---

{@operationsNote}

This plugin generates:

- a function running an ApolloClient query and cache extraction, to be used inside `getServerSideProps` or `getStaticProps`
- a React Apollo HOC running an ApolloClient query consuming the InMemory cache
- an interface for the React component wrapped by the HOC

It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.

## Motivations

Nextjs recently introduced `getServerSideProps` and `getStaticProps` which doesn't allow to use the HOC pattern adopted by the official apollo graphql plugin (based on `getInitialProps`). At the same time the SSR method offered by apollo client (`getDataFromTree`) enforces the React app to render multiple times in order to collect and fetch all the relevant queries.
By declaring a top level query we can save rendering time and provide a simpler pattern which works with `getServerSideProps`. Note that this pattern requires each SSR query to run at top level. [Example](https://github.com/correttojs/graphql-codegen-apollo-next-ssr/tree/master/example)

## API Reference

### `apolloReactCommonImportFrom`

type: `string`
default: `"`

Customize the package where apollo-react common lib is loaded from.

### `apolloImportFrom`

type: `string`
default: `"`

Customize the package where apollo-client lib is loaded from.

### `apolloCacheImportFrom`

type: `string`
default: `"`

Customize the package where apollo-cache-inmemory lib is loaded from.

### `apolloReactHooksImportFrom`

type: `string`
default: `"`

Customize the package where apollo-react hooks lib is loaded from.

### `reactApolloVersion`

type: `number (values: 2, 3)`
default: `2`

Sets the version of react-apollo.

#### Usage Examples

```yaml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-operations
    - typescript-react-apollo
  config:
    reactApolloVersion: 3
```

### `withHOC`

type: `boolean`
default: `true`

Customized the output by enabling/disabling the HOC.

#### Usage Examples

```yaml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-operations
    - typescript-react-apollo
  config:
    withHOC: false
```

### `withHooks`

type: `boolean`
default: `false`

Customized the output by enabling/disabling the generated React Hooks.

#### Usage Examples

```yaml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-operations
    - typescript-react-apollo
  config:
    withHooks: false
```

### `excludePatterns`

type: `string`
default: `''`

Regexp to exclude a certain operation name.

### `excludePatternsOptions`

type: `string`
default: `''`

Regexp options to exclude a certain operation name.

### `pre`

type: `string`
default: `''`

Add custom code before each operation.

### `post`

type: `string`
default: `''`

Add custom code after each operation.

### `customImports`

type: `string`
default: `''`

Add custom imports needed by pre/post.

### `gqlImport`

type: `string`
default: `gql#graphql-tag`

Customize from which module will `gql` be imported from.
This is useful if you want to use modules other than `graphql-tag`, e.g. `graphql.macro`.

#### Usage Examples

##### graphql.macro

```yaml
config:
  gqlImport: graphql.macro#gql
```

##### Gatsby

```yaml
config:
  gqlImport: gatsby#graphql
```

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

```yaml
config:
  documentMode: external
  importDocumentNodeExternallyFrom: path/to/document-node-file
```

```yaml
config:
  documentMode: external
  importDocumentNodeExternallyFrom: near-operation-file
```

### `scalars`

type: `ScalarsMap`

Extends or overrides the built-in scalars and custom GraphQL scalars to a custom type.

#### Usage Examples

```yaml
config:
  scalars:
    DateTime: Date
    JSON: '{ [key: string]: any }'
```

### `namingConvention`

type: `NamingConvention`
default: `change-case-all#pascalCase`

Allow you to override the naming convention of the output.
You can either override all namings, or specify an object with specific custom naming convention per output.
The format of the converter must be a valid `module#method`.
Allowed values for specific output are: `typeNames`, `enumValues`.
You can also use "keep" to keep all GraphQL names as-is.
Additionally, you can set `transformUnderscore` to `true` if you want to override the default behavior,
which is to preserve underscores.

#### Usage Examples

##### Override All Names

```yaml
config:
  namingConvention: change-case-all#lowerCase
```

##### Upper-case enum values

```yaml
config:
  namingConvention:
    typeNames: change-case-all#pascalCase
    enumValues: change-case-all#upperCase
```

##### Keep names as is

```yaml
config:
  namingConvention: keep
```

##### Remove Underscores

```yaml
config:
  namingConvention:
    typeNames: change-case-all#pascalCase
    transformUnderscore: true
```

### `typesPrefix`

type: `string`
default: ``

Prefixes all the generated types.

#### Usage Examples

```yaml
config:
  typesPrefix: I
```

### `skipTypename`

type: `boolean`
default: `false`

Does not add `__typename` to the generated types, unless it was specified in the selection set.

#### Usage Examples

```yaml
config:
  skipTypename: true
```

### `nonOptionalTypename`

type: `boolean`
default: `false`

Automatically adds `__typename` field to the generated types, even when they are not specified
in the selection set, and makes it non-optional

#### Usage Examples

```yaml
config:
  nonOptionalTypename: true
```
