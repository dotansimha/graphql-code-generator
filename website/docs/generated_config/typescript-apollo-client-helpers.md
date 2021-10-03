## Installation



<img alt="typescript-apollo-client-helpers plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/typescript-apollo-client-helpers?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/typescript-apollo-client-helpers
:::

## API Reference

### `useTypeImports`

type: `boolean`
default: `false`

Will use `import type {}` rather than `import {}` when importing only types. This gives
compatibility with TypeScript's "importsNotUsedAsValues": "error" option


### `requireKeyFields`

type: `boolean`
default: `false`

Remove optional sign from all `keyFields` fields.


### `requirePoliciesForAllTypes`

type: `boolean`
default: `false`

Remove optional sign from all generated keys of the root TypePolicy.
