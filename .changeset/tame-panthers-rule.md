"@graphql-codegen/cli": patch
---

Fix GraphQL Config loading to forward nested `extensions.codegen.config` options
when loading schemas/documents, matching `codegen.ts` behavior.
