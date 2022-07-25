---
'@graphql-codegen/typescript-react-query': major
---

Introduces breaking changes to support `react-query@4.0.0`:
- react query package is now `@tanstack/react-query` -> import changes
- introduced a `legacyMode` flag (`false` by default)

/!\ If you are using the 'react-query' package or `react-query < 4`, please set the `legacyMode` option to `true`. /!\
