---
id: hasura-allow-list
---

Generate hasura allow list metadata from graphql files

You can use this plugin to generate an [allow list](https://hasura.io/docs/latest/graphql/cloud/security/allow-lists.html) for your [hasura](https://hasura.io/) project.

This can be useful to keep your allow list and front end code in sync.

{@apiDocs}

## Examples

```yaml
# ...
generates:
  path/to/metadata/allow_list.yaml:
    plugins:
      - hasura-allow-list:
```
