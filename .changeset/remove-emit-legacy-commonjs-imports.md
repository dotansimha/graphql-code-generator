---
'@graphql-codegen/cli': major
'@graphql-codegen/plugin-helpers': major
'@graphql-codegen/visitor-plugin-common': major
'@graphql-codegen/gql-tag-operations': major
'@graphql-codegen/typescript-operations': major
'@graphql-codegen/client-preset': major
'@graphql-codegen/graphql-modules-preset': major
---

BREAKING CHANGE: Remove the deprecated `emitLegacyCommonJSImports` config option and the `--emit-legacy-common-js-imports` CLI flag

Use `importExtension` (or `--import-extension`) to set the extension appended to relative imports. When `importExtension` is not set, no extension is appended.

Migration:

```diff
 const config: CodegenConfig = {
-  emitLegacyCommonJSImports: false,
+  importExtension: '.js',
 };
```
