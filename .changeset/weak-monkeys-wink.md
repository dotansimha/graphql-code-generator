---
'@graphql-codegen/cli': patch
---

### Summary

- Migrate to [`listr2`](https://listr2.kilic.dev)
- Remove custom renderer for `listr`
- Remove unused dependencies

### Why

[`listr`](https://github.com/SamVerschueren/listr) is not actively maintained and we have to maintain our custom renderer for it to display errors. Migrating to `listr2` it just works out of the almost similar to how it was working in past and is a actively maintained.

### Dev notes
Big change for us is how errors were collected. In `listr` errors were thrown and were caught in the `end` function of our custom `listr` Renderer but with `listr2` we don't really get `Error` in `end` function always so instead we use the [context](https://listr2.kilic.dev/getting-started/the-concept-of-context) to collect errors from all the tasks and then show them after all the tasks are finished.

