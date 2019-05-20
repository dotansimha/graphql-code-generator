---
id: add
title: Add
---

`add` plugin adds custom text to your output file.

You can use this plugin to add custom code, imports, comments and more to your output file.

## Installation

    $ yarn add -D @graphql-codegen/add
    
    
> Notice that the order of plugins in the yaml config matters.
> If you need to add something to the top of the file, for example `/* eslint-disable */`, makes sure to place the `add` plugin before the other plugins, so their output won't be on top of the `add` addition.

## Examples

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - add: '// THIS IS A GENERATED FILE'
      - typescript
```
