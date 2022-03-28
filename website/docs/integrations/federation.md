---
id: federation
title: Apollo Federation
---

The `typescript-resolvers` plugin also supports [Apollo Federation](https://apollographql.com/docs/apollo-server/federation/introduction).

To use it, add `federation: true` to your configuration:

```yml
generates:
  ./src/types.ts:
    plugins:
      - typescript
      - typescript-resolvers
    config:
      federation: true
```

It will add the required GraphQL directives to your codegen schema and generate a compatible resolvers signature for Apollo Federation.
