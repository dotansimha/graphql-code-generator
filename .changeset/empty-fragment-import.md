---
'@graphql-codegen/visitor-plugin-common': patch
---

Avoid emitting an empty import statement (`import '...';`) when an import source has no identifiers and no namespace.
