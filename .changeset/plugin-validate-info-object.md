---
'@graphql-codegen/core': major
'@graphql-codegen/plugin-helpers': major
'@graphql-codegen/fragment-matcher': major
'@graphql-codegen/introspection': major
'@graphql-codegen/schema-ast': major
'@graphql-codegen/typescript-document-nodes': major
'@graphql-codegen/typed-document-node': major
---

BREAKING CHANGE: A plugin's `validate` function now receives an info object as its fourth argument, matching the `plugin` function: `validate(schema, documents, config, { outputFile, allPlugins, pluginContext })`. Custom plugins that export `validate` and read `outputFile`, `allPlugins` or `pluginContext` as positional arguments must destructure them from the fourth argument instead.

Refs #11071
