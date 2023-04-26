---
'@graphql-codegen/graphql-modules-preset': minor
'@graphql-codegen/plugin-helpers': minor
'@graphql-codegen/core': minor
'@graphql-codegen/cli': minor
'@graphql-codegen/client-preset': minor
---

Added a "delayed schema generator" feature that allows dynamic schema generation. After loading existing GraphQL documents and schemas, this feature allows you to generate a new schema by referencing them. It is especially useful for generating the necessary schemas for local-only fields created by Document Transform. Please see the Document Transform documentation for usage.
