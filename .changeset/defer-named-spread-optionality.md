---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-operations': patch
---

Keep `@defer` fields optional: expand overlapping named `@defer` spreads into per-selection unions, preserve optionality on interface/union selections, surface nested `@defer`/`@stream` through inlined fragment spreads, and restore trailing `_` on implementing-type aliases when `omitOperationSuffix` is enabled
