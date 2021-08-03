---
'@graphql-codegen/typescript-resolvers': major
---

Set `noSchemaStitching: true` by default. 

If you need the resolvers signature to support schema-stitching, please add to your config:

```yml
noSchemaStitching: false
```
