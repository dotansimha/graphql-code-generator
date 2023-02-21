---
"@graphql-codegen/cli": minor
"@graphql-codegen/core": minor
"@graphql-codegen/plugin-helpers": minor
"@graphql-codegen/client-preset": minor
"@graphql-codegen/gql-tag-operations-preset": minor
"@graphql-codegen/graphql-modules-preset": minor
---

Introduce a new feature called DocumentTransform.

DocumentTransform is a functionality that allows you to modify `documents` before they are processed by plugins. You can use functions passed to the `documentTransforms` option to make changes to GraphQL documents.

To use this feature, you can write `documentTransforms` as follows:

```ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://localhost:4000/graphql',
  documents: ['src/**/*.tsx'],
  generates: {
    './src/gql/': {
      preset: 'client',
      documentTransforms: [
        {
          transform: ({ documents }) => {
            // Make some changes to the documents
            return documents;
          },
        },
      ],
    },
  },
};
export default config;
```

For instance, to remove a `@localOnlyDirective` directive from `documents`, you can write the following code:

```js
import type { CodegenConfig } from '@graphql-codegen/cli';
import { visit } from 'graphql';

const config: CodegenConfig = {
  schema: 'https://localhost:4000/graphql',
  documents: ['src/**/*.tsx'],
  generates: {
    './src/gql/': {
      preset: 'client',
      documentTransforms: [
        {
          transform: ({ documents }) => {
            return documents.map(documentFile => {
              documentFile.document = visit(documentFile.document, {
                Directive: {
                  leave(node) {
                    if (node.name.value === 'localOnlyDirective') return null;
                  },
                },
              });
              return documentFile;
            });
          },
        },
      ],
    },
  },
};
export default config;
```

DocumentTransform can also be specified by file name. You can create a custom file for a specific transformation and pass it to `documentTransforms`.

Let's create the document transform as a file:

```js
module.exports = {
  transform: ({ documents }) => {
    // Make some changes to the documents
    return documents;
  },
};
```

Then, you can specify the file name as follows:

```ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://localhost:4000/graphql',
  documents: ['src/**/*.tsx'],
  generates: {
    './src/gql/': {
      preset: 'client',
      documentTransforms: ['./my-document-transform.js'],
    },
  },
};
export default config;
```
