---
"@graphql-codegen/client-preset": patch
"website": patch
---

Added configuration to allow for custom hash functions for persisted documents in the client preset

### Example
```ts filename="codegen.ts" {10-12}
import { type CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'schema.graphql',
  documents: ['src/**/*.tsx'],
  generates: {
    './src/gql/': {
      preset: 'client',
      presetConfig: {
        persistedDocuments: {
          hashAlgorithm: operation => {
            const shasum = crypto.createHash('sha512')
            shasum.update(operation)
            return shasum.digest('hex')
          }
        }
      }
    }
  }
}
```
