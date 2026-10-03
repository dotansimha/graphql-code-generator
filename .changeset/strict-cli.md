---
'@graphql-codegen/cli': patch
'@graphql-codegen/plugin-helpers': patch
---

Fix type errors in `cli` under `strict: true`:

- `@graphql-codegen/cli`: `loadCodegenConfig` returns `Promise<LoadCodegenConfigResult | null>`, matching the `null` it resolves to when no config file is found. `YamlCliFlags` includes the kebab-case `ignore-no-documents`, `emit-legacy-common-js-imports` and `import-extension` flags that the CLI reads. `CodegenContext.filepath` is optional, and watch mode only watches the config file when the context has a `filepath`. `CodegenContext.getConfig()` without an argument returns `Types.Config`, and `getConfig(extraConfig)` returns `T & Types.Config`. `CodegenContext.checkModeStaleFiles` is typed as `string[]`. Adds `@types/yargs`, `@types/babel__generator` and `@types/babel__template` as dev dependencies.
- `@graphql-codegen/plugin-helpers`: `normalizeInstanceOrArray` and `normalizeConfig` accept `null` and `undefined`, returning `[]`.

Generated output is unchanged.
