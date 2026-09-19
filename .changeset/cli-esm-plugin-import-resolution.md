---
'@graphql-codegen/cli': patch
---

Fix dynamically-loaded plugins/presets in ESM builds. Previously, ESM used the bare module specifier without resolving it relative to the consuming project first, so a plugin only loaded if it happened to be reachable from the CLI package's own `node_modules`. Resolving it the same way the CJS build already does (`relativeRequire.resolve(mod)`) fixes that, but the resolved absolute path also has to be converted to a `file://` URL (`pathToFileURL(...).href`) before being passed to `import()` — otherwise, on Windows, the loader misparses a raw path like `C:\...` as a `c:` protocol scheme and throws `ERR_UNSUPPORTED_ESM_URL_SCHEME`.
