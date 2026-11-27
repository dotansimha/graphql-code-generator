---
'@graphql-codegen/visitor-plugin-common': patch
---

Emit a fragment member type for every union or interface member when fragment spreads are masked or combined, including members that select no fields. Nested spreads were referring to those names, and TypeScript reported them as missing.
