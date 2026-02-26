---
'@graphql-codegen/typescript-operations': major
---

BREAKING CHANGE: Decouple `typescript-operations` plugin from `typescript` plugin

Previously, `TypeScriptOperationVariablesToObject` from `typescript-operations` was extending from `typescript` plugin. This made it (1) very hard to read, as we need to jump from base class <-> typescript class <-> typescript-operations class to understand the flow and (2) very hard to evolve the two independently (which is the point of this work).

Since there's not much shared logic anyways, it's simpler to extend the `typescript-operations` class from the base class directly.
