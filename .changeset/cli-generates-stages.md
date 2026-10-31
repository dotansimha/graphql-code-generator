---
'@graphql-codegen/cli': minor
---

PoC: run the elements of a `generates` array as sequential stages that append to the same output file, handing each stage's plugin `meta` to the next stage as `pluginContext.previousStageMeta`
