---
id: add
title: Add
---

`add` plugin adds custom text to your output file.

You can use this plugin to add custom code, imports, comments and more to your output file.

## Installation

Install using `npm` (or `yarn`):

    $ npm install @graphql-codegen/add

## Examples

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - add: '// THIS IS A GENERATED FILE'
      - typescript
```
