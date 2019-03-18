---
id: time
title: Time
---

`time` plugin adds the current time to your output file.

## Installation

Install using `npm` (or `yarn`):

    $ npm install @graphql-codegen/time

## Examples

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - time
      - typescript
```
