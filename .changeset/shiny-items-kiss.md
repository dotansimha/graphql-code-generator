---
'@graphql-codegen/plugin-helpers': minor
'@graphql-codegen/cli': minor
---

Add new config option to not exit with non-zero exit code when there are no documents.

You can use this option in your config:
```yaml
schema: 'schema.graphql'
documents:
  - 'src/**/*.graphql'
ignoreNoDocuments: true
```

Alternative you can use the CLI to set this option:
```bash
$ codegen --config-file=config.yml --ignore-no-documents
```
