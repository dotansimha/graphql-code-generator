---
'@graphql-codegen/cli': major
---

`generate()` now returns `Promise<FileOutput[] | void>` instead of `Promise<FileOutput[] | any>`. The result is no longer `any`, so consumers using the result as an array must narrow it first.

Refs #11071
