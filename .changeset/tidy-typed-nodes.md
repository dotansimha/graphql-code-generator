---
'@graphql-codegen/typed-document-node': patch
---

Skip documents without a `document` AST instead of throwing from `concatAST` when the plugin is called directly with one, and don't add an empty import when `documentNodeImport` has no module. Generated output from the CLI is unchanged.
