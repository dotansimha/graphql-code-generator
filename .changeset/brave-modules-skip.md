---
'@graphql-codegen/graphql-modules-preset': patch
---

Skip sources without a `location` when grouping sources by module, instead of throwing from `path.normalize`, and skip sources without a `document` AST when building each module's document. Generated output from the CLI is unchanged.
