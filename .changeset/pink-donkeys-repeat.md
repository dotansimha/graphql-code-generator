---
'@graphql-codegen/testing': patch
---

Resolve the `@types` directory from `@types/node`'s own location rather than from TypeScript's.

`validateTs` and `compileTs` derived `typeRoots` as
`resolve(require.resolve('typescript'), '../../../@types/')`, which only lands on
`node_modules/@types` in a flat npm/yarn layout. Under pnpm's default isolated layout
`require.resolve` returns the realpath inside the virtual store, so it pointed at a directory that
does not exist and no ambient Node typings were ever loaded — which is why `options.types ||=
['node']` had to be disabled on TypeScript 6. Locating the directory from `@types/node` itself is
correct under every layout, and the `types` option is restored alongside it.

`@types/node` is now a declared devDependency of this package rather than a phantom dependency of
the workspace root. This is an internal test-utility fix; no exported signature changes.
