---
"@graphql-codegen/client-preset-codemod": minor
---

Introduce `@graphql-codegen/client-preset-codemod`, a codemod that rewrites `client-preset`
`graphql(\`...\`)` call sites into direct imports from the generated artifacts. It performs the
same transform as `client-preset`'s Babel plugin and `@graphql-codegen/client-preset-swc-plugin`,
but once, on demand, from the CLI — so bundlers don't need either plugin wired into the build
pipeline to get code-splitting/tree-shaking on `client-preset` documents.
