---
id: typescript-svelte-apollo
title: Typescript Svelte Apollo
---

This plugin generates observable Apollo queries with Typescript typings.

This is a community plugin, to report eventual issues or find more examples, refer to this [repository](https://github.com/ticruz38/graphql-codegen-svelte-apollo#readme)

It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.

## Installation



<img alt="graphql-codegen-svelte-apollo plugin version" src="https://img.shields.io/npm/v/graphql-codegen-svelte-apollo?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>



:::shell Using `yarn`
    yarn add -D graphql-codegen-svelte-apollo
:::

## API Reference

### `clientPath`

type: `string`
default: `null`
required: true

Path to the apollo client for this project (should point to a file with an apollo-client as default export)

#### Usage Examples

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - graphql-codegen-svelte-apollo
 config:
   clientPath: PATH_TO_APOLLO_CLIENT
```

### `asyncQuery`
type: `boolean`
default: `false`

By default, the plugin only generate observable queries, sometimes it may be useful to generate promise-based queries

#### Usage Examples

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - graphql-codegen-svelte-apollo
 config:
   clientPath: PATH_TO_APOLLO_CLIENT
   asyncQuery: true
```

## Usage Example

### With Observable queries

For the given input:

```graphql
fragment TransactionFragment on TransactionDescription {
    contractAddress
    from
    gasUsed
    gasPrice
    input
    isError
    to
    value
}

query Transactions($address: String) {
    transactions(address: $address) {
        ...TransactionFragment
    }
}
```

And the following configuration:

```yaml
schema: YOUR_SCHEMA_HERE
documents: "./src/**/*.graphql"
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - graphql-codegen-svelte-apollo
 config:
   clientPath: PATH_TO_APOLLO_CLIENT
```

Codegen will pre-compile the GraphQL operation into a `DocumentNode` object, and generate a ready-to-use Apollo query for each operation you have.

In you application code, you can import it from the generated file, and use the query in your component code: 

```html
<script lang="ts">
  import { Transactions } from "codegen";

  var address = "0x0000000000000000000000000000"
  $: t = Transactions({ address });
</script>

<ul>
    {#each $t?.data?.transactions || [] as transaction}
        <li>Sent transaction from {transaction.from} to {transaction.to}</li>
    {/each}
</ul>
```

Each time you change the address, the query will re-fetch and show the new results in the template.

### With Async Queries

Sometimes, you may need/prefer to have an async query (only available with asyncQuery option set to true)

For the given input:

```graphql
fragment TransactionFragment on TransactionDescription {
    contractAddress
    from
    gasUsed
    gasPrice
    input
    isError
    to
    value
}

query Transactions($address: String) {
    transactions(address: $address) {
        ...TransactionFragment
    }
}
```

And the following configuration:

```yaml
schema: YOUR_SCHEMA_HERE
documents: "./src/**/*.graphql"
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - graphql-codegen-svelte-apollo
 config:
   clientPath: PATH_TO_APOLLO_CLIENT
   asyncQuery: true
```

Codegen will pre-compile the GraphQL operation into a `DocumentNode` object, and generate a ready-to-use Apollo query for each operation you have.

In you application code, you can import it from the generated file, and use the query in your component code: 

```html
<script lang="ts">
  import { AsyncTransactions } from "codegen";

  var address = "0x0000000000000000000000000000"
</script>

<ul>
  {#await AsyncTransactions({ address })}
    Loading...
  {:then transactions}
    {#each transactions || [] as transaction}
        <li>Sent transaction from {transaction.from} to {transaction.to}</li>
    {/each}
  {/await}
</ul>
```