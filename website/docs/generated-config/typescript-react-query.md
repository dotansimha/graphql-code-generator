This plugin generates `React-Query` Hooks with TypeScript typings.

It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.

## Installation



<img alt="typescript-react-query plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/typescript-react-query?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/typescript-react-query
:::

## API Reference

### `fetcher`

type: `object | object | string`

Customize the fetcher you wish to use in the generated file. React-Query is agnostic to the data-fetcing layer, so you should provide it, or use a custom one.

The following options are available to use:
- 'fetch' - requires you to specify endpoint and headers on each call, and uses `fetch` to do the actual http call.
- `{ endpoint: string, fetchParams: RequestInit }`: hardcode your endpoint and fetch options into the generated output, using the environment `fetch` method. You can also use `process.env.MY_VAR` as endpoint or header value.
- `file#identifier` - You can use custom fetcher method that should implement the exported `ReactQueryFetcher` interface. Example: `./my-fetcher#myCustomFetcher`.
- `graphql-request`: Will generate each hook with `client` argument, where you should pass your own `GraphQLClient` (created from `graphql-request`).


### `exposeQueryKeys`

type: `boolean`
default: `false`

For each generate query hook adds getKey(variables: QueryVariables) function. Useful for cache updates. Example:
const query = useUserDetailsQuery(...);
const key = useUserDetailsQuery.getKey({id: theUsersId});
// use key in a cache update after a mutation


### `errorType`

type: `string`
default: `unknown`

Changes the default "TError" generic type.


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


### `optimizeDocumentNode`

type: `boolean`
default: `true`

If you are using `documentNode: documentMode | documentNodeImportFragments`, you can set this to `true` to apply document optimizations for your GraphQL document.
This will remove all "loc" and "description" fields from the compiled document, and will remove all empty arrays (such as `directives`, `arguments` and `variableDefinitions`).


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