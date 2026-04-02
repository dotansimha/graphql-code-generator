---
'@graphql-codegen/gql-tag-operations': minor
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-operations': minor
'@graphql-codegen/plugin-helpers': minor
'@graphql-codegen/cli': minor
'@graphql-codegen/client-preset': minor
---

Add support for `externalDocuments`

`externalDocuments` declares GraphQL documents that will be read but will not have type files generated for them. These documents are available to plugins for type resolution (e.g. fragment types), but no output files will be generated based on them. Accepts the same formats as `documents`.

This config option is useful for monorepos where each project may want to generate types for its own documents, but some may need to read shared fragments from across projects.
