---
'@graphql-codegen/cli': major
'@graphql-codegen/plugin-helpers': major
'@graphql-codegen/core': major
'@graphql-codegen/visitor-plugin-common': major
'@graphql-codegen/client-preset': major
'@graphql-codegen/graphql-modules-preset': major
'@graphql-codegen/schema-ast': major
'@graphql-codegen/gql-tag-operations': major
'@graphql-codegen/typescript-resolvers': major
---

BREAKING CHANGE: `@graphql-tools/*` dependencies are updated to their latest majors, which require Node.js 22.18.0 or later and GraphQL 16 or 17. If you import `@graphql-tools/*` packages in your own code, update them to the same majors to avoid duplicate installs. `@graphql-tools/code-file-loader@9` now extracts `#graphql`-marked template literals by default, so code files that contain such templates can produce newly found documents; check your generated output after upgrading. To keep the previous behavior, set `pluckConfig: { gqlHashComment: '' }`.
