---
'@graphql-codegen/cli': patch
---

Use ESM for CLI instead of CJS;

For backwards compatibility; `graphql-codegen-esm` is reserved, and also `graphql-codegen-cjs` is added for users who want to use CJS.

So the commands are;
- `graphql-codegen` - ESM version, default
- `graphql-codegen-esm` - ESM version, same as above, but reserved for backwards compatibility
- `graphql-codegen-cjs` - CJS version, for users who want to use CJS, but not recommended for new users. Will be removed in the future.
- `gql-gen` - ESM version, same as `graphql-codegen`
- `graphql-code-generator` - ESM version, same as `graphql-codegen` and `gql-gen`
