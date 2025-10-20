---
'@graphql-codegen/cli': patch
---

In watch mode, do not write output on failure

Previously, on partial or full failure, watch mode still write to output. However, since the output'd be an empty array, it will then call `removeStaleFiles` internally to remove all previously generated files.

This patch puts a temporary fix to avoid writing output on any failure to fix the described behaviour.

This also means the `config.allowPartialOutputs` does not work in watch mode for now.
