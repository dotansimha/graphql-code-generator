---
'@graphql-codegen/client-preset': minor
---

Add support for persisted documents.

You can now generate and embed a persisted documents hash for the executable documents.

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
        persistedDocuments: true,
      }
    }
  }
}

export default config
```

This will generate `./src/gql/persisted-documents.json` (dictionary of hashes with their operation string).

In addition to that each generated document node will have a `__meta__.hash` property.

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

console.log((allFilmsWithVariablesQueryDocument as any)["__meta__"]["hash"])
```

