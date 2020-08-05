---
'@graphql-codegen/typed-document-node': patch
---

Allow this plugin to work with `documentMode: graphqlTag` correctly.

Added validation for preventing `documentMode: string` because it's not supported in this plugin.