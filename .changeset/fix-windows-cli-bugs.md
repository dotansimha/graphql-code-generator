---
'@graphql-codegen/cli': patch
---

Fix a Windows-specific `import()` failure on absolute paths when loading a schema/document from a `.js`/`.cjs`/`.mjs` file (via `@graphql-tools/code-file-loader`), and when loading modules passed to that loader's own `require` option. Node's dynamic `import()` rejects raw absolute Windows paths (the drive letter is parsed as a URL scheme). Fixed by bumping `@graphql-tools/code-file-loader` to `8.1.39`, which contains the upstream fix ([ardatan/graphql-tools#8421](https://github.com/ardatan/graphql-tools/pull/8421)).
