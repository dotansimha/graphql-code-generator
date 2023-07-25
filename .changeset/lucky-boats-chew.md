---
'@graphql-codegen/client-preset': minor
---

Add the `addTypenameSelectionDocumentTransform` for automatically adding `__typename` selections to all objct type selection sets.

This is useful for GraphQL Clients such as Apollo Client or urql that need typename information for their cache to function.

**Example Usage**

```
import { addTypenameSelectionDocumentTransform } from '@graphql-codegen/client-preset';
import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "YOUR_GRAPHQL_ENDPOINT",
  documents: ["./**/*.{ts,tsx}"],
  ignoreNoDocuments: true,
  generates: {
    "./gql/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        persistedDocuments: true,
      },
      documentTransforms: [addTypenameSelectionDocumentTransform],
    },
  },
};

export default config;
```
