---
"@graphql-codegen/cli": minor
"@graphql-codegen/core": minor
"@graphql-codegen/plugin-helpers": minor
"@graphql-codegen/client-preset": minor
"@graphql-codegen/gql-tag-operations-preset": minor
"@graphql-codegen/graphql-modules-preset": minor
---

Add a feature to transform documents.

Plugin will have the following functions:
```js
module.exports = {
  plugin: () => {
    return 'hello'
  },
  transformDocuments: (_schema, documents) => {
    // Make some changes to the documents
    return documents;
  },
  validateBeforeTransformDocuments: () => {
    // Raises an error if necessary
  },
};
```

Use it as follows:

```ts
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
   schema: 'https://localhost:4000/graphql',
   documents: ['src/**/*.tsx'],
   generates: {
      './src/gql/': {
        preset: 'client',
        documentTransformPlugins: ['./my-plugin.js'],
        plugins: ['./my-plugin.js']
      }
   }
}
export default config
```

For example, to remove a `@localOnlyDirective` directive from documents:

```js
const { visit, print } = require('graphql')

module.exports = {
  plugin(schema, documents, config) {
    // Output `documents` as an example.
    return documents.map(documentFile => `${print(documentFile.document)}`).join('\n')
  },
  transformDocuments(schema, documents, config) {
    return documents.map(documentFile => {
      documentFile.document = visit(documentFile.document, {
        Directive: {
          leave(node) {
            if (node.name.value === 'localOnlyDirective') return null
          }
        }
      })
      return documentFile
    })
  }
}
```
