---
'@graphql-codegen/cli': patch
---

conflict with `graphql-config` also using TypeScriptLoader(), causing a double `ts-node` register.
