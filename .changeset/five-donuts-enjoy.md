---
'@graphql-codegen/gql-tag-operations-preset': minor
---

The plugin now generates an `gql.ts` file for the `gql` function, whose contents are re-exported from the `index.ts` file. In module augmentation mode the `index.ts` file is omitted and only a `gql.d.ts` file is generated.

Support for fragment masking via the new `fragmentMasking` configuration option. [Check out the Fragment Masking Documentation](https://graphql-code-generator.com/plugins/gql-tag-operations-preset#fragment-masking).
