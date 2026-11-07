---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-operations': minor
'@graphql-codegen/typed-document-node': minor
'@graphql-codegen/client-preset': minor
---

Add support for graphql v17 fragment arguments (`experimentalFragmentArguments`).

To use fragment arguments, set the parser option in the root `config`:

```ts
const config: CodegenConfig = {
  config: { experimentalFragmentArguments: true },
  // ...
};
```
