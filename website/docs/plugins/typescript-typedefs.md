---
id: typescript-typedefs
title: TypeScript Typedefs
---

This plugin generates the gql typeDefs constant from the schema. 

## Installation

    $ yarn add -D @graphql-codegen/typescript-typedefs

## Usage

Run `graphql-codegen` as usual:

```yaml
schema: schema.json
generates:
  ./src/generated-types.ts:
    plugins:
      - typescript
      - typescript-typedefs
```
