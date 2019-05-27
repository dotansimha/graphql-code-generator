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

## Input parameters

To control in which section of output the text will be added, the input can be specified
as an object. The object takes two parameters:

- `placement`: Optional specification of output section of added text
  - Input: `'prepend' | 'content' | 'append'`
  - Default: `'prepend'`
- `content`: Content to add to file, can be text or an array/list of strings

## Examples

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - add: '/* tslint:disable */'
      - add:
          content:
            - ''
            - 'declare namespace GraphQL {'
      - add:
          placement: 'append'
          content: '}'
      - typescript
```
