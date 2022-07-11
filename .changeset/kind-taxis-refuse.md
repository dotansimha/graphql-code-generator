---
'@graphql-codegen/cli': minor
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/gql-tag-operations': minor
'@graphql-codegen/near-operation-file-preset': minor
'@graphql-codegen/plugin-helpers': minor
---

Add new flag to emit legacy common js imports. Default it will be `true` this way it ensure that generated code works with [non-compliant bundlers](https://github.com/dotansimha/graphql-code-generator/issues/8065).

You can use the option in your config:
```yaml
schema: 'schema.graphql'
 documents:
   - 'src/**/*.graphql'
 emitLegacyCommonJSImports: true
```

Alternative you can use the CLI to set this option:
```bash
 $ codegen --config-file=config.yml --emit-legacy-common-js-imports
```
