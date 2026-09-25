---
'@graphql-codegen/typescript-document-nodes': patch
---

Skip documents without a `document` AST instead of throwing from `concatAST` when the plugin is called directly with one. Generated output from the CLI is unchanged.
