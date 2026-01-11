---
'@graphql-codegen/cli': patch
---

fix(graphql-codegen-cli): Don't hang when 0 CPUs are found

Fixes generation when 0 CPUs are returned by os.cpus(), which occurs in sandbox environments.
