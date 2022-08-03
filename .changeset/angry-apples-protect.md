---
'@graphql-codegen/cli': minor
---

Introduce `mergeMappers` config flags will allows to reuse mappers across generated files:

```yml
schema: "schema.graphql"
documents: src/*.ts
mergeMappers: true
config:
    mappers:
      ID: IDType
generates:
  resolvers-types-1.ts:
    plugins:
      - typescript
      - typescript-resolvers
    config:
      mappers:
        String: StringType
  resolvers-types-2.ts:
    plugins:
      - typescript
      - typescript-resolvers
    config:
      mappers:
        String: StringType
```
