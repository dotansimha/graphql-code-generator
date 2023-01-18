---
'@graphql-codegen/client-preset': minor
---

Add support for embedding metadata in the document AST.

It is now possible to embed metadata (e.g. for your GraphQL client within the emitted code).

```ts
/** codegen.ts */
import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
  documents: ['src/**/*.tsx'],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        onExecutableDocumentNode(documentNode) {
          return {
            operation: documentNode.definitions[0].operation,
            name: documentNode.definitions[0].name.value
          }
        }
      }
    }
  }
}

export default config
```

You can then access the metadata via the `__meta__` property on the document node.

```ts
import { gql } from './gql.js'

const allFilmsWithVariablesQueryDocument = graphql(/* GraphQL */ `
  query allFilmsWithVariablesQuery($first: Int!) {
    allFilms(first: $first) {
      edges {
        node {
          ...FilmItem
        }
      }
    }
  }
`)

console.log((allFilmsWithVariablesQueryDocument as any)["__meta__"])
```
