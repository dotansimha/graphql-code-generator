# @graphql-codegen/typescript-urql-sdk

GraphQL Code Generator plugin for generating a ready-to-use SDK based on [`urql`](https://npmjs.com/package/@urql/core) client and GraphQL operations.

## Usage

Configuration:

```yml
schema: YOUR_SCHEMA_HERE
documents: './src/**/*.graphql'
generates:
  ./generated-types.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-urql-sdk
```

Generated SDK:

```ts
import { Client } from '@urql/core'

const client = new Client({ url: '/graphql' })
const sdk = getSdk(client)

await sdk.hello().toPromise()
```
