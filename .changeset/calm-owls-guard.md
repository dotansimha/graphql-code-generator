---
'@graphql-codegen/core': patch
---

Skip documents without a `document` AST when validating documents against the schema, instead of passing `undefined` to validation. Generated output from the CLI is unchanged.
