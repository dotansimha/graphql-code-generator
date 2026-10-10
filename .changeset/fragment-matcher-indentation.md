---
'@graphql-codegen/fragment-matcher': patch
---

Fix indentation of generated TypeScript and JavaScript output. The plugin previously emitted declarations indented by six spaces while the `JSON.stringify` content was flush left, producing misaligned code (for example an empty `possibleTypes` map). The generated output is now emitted flush left with consistent indentation.
