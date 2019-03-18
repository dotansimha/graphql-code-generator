---
id: schema-ast
title: Schema AST
---

`schema-ast` plugin prints the merged schema as string. If multiple schemas are provided, they will be merged and printed as one schema.

## Installation

Install using `npm` (or `yarn`):

    $ npm install @graphql-codegen/schema-ast

## Examples

```yaml
# ...
schema:
  - 'http://localhost:3000/graphql'
  - './src/**/*.graphql'
  - 'scalar MyCustomScalar'
generates:
  path/to/file.graphql:
    plugins:
      - schema-ast
```
