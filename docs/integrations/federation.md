---
id: federation
title: Apollo Federation
---

The `typescript-resolvers` plugin also supports [Apollo Federation](https://www.apollographql.com/docs/apollo-server/federation/introduction/).

In order to use it, add `federation: true` to your configuration:

```yml
generates:
  ./src/types.ts:
    plugins:
      - typescript
      - typescript-resolvers
    config:
      federation: true
```

It will make sure to add the required GraphQL directives to your codegen schema, and will generate a compatible resolvers signature for Apollo Federation.
