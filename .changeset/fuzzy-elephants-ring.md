---
'@graphql-codegen/gql-tag-operations-preset': minor
'@graphql-codegen/near-operation-file-preset': minor
'@graphql-codegen/typescript-oclif': minor
---

Attach `.js` extension to relative file imports for compliance with ESM module resolution. Since in CommonJS the `.js` extension is optional, this is not a breaking change.

If you have path configuration within your configuration, consider attaching `.js` if you are migrating to ESM.

```yml
mappers:
  MyOtherType: './my-file.js#MyCustomOtherType',
```
