---
id: presets-index
title: All Presets
---

GraphQL Code Generator also support presets - which is a way to manipulate and affect the execution of plugins.

Presets are CLI extensions, that allow manipulation of a `generates` section of codegen, based on custom logic.

You can use and writes presets to tell codegen which output files to creates, and what each one should include.

## Available Presets

| Name                  | Purpose                                                                                                     | Package Name & Docs                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `near-operation-file` | Generates operation code near the source file                                                               | [`@graphql-codegen/near-operation-file-preset`](./near-operation-file.md) |
| `gql-tag`             | Generate types for inline gql tag usages. Reduces import statement amount and the file count significantly. | [`@graphql-codegen/gql-tag-preset`](./gql-tag.md)                         |
| `import-types-`       | Allow you to separate base types declarations and the operations that uses it                               | [`@graphql-codegen/import-types-preset`](./import-types.md)               |
| `graphql-modules`     | Generates types and resolvers signature for GraphQL-Modules                                                 | [`@graphql-codegen/graphql-modules-preset`](./graphql-modules.md)         |
