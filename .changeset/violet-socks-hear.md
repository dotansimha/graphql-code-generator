---
'@graphql-codegen/cli': patch
---

Bumps `@graphql-tools/url-loader` to the latest `cross-undici-fetch` version that has pinned `undici` to `~5.5.0` in order to fix a bug/breaking-change introduced with `undici@5.6.0` that causes a `GET/HEAD requests cannot have 'body'` error.
See https://github.com/ardatan/graphql-tools/pull/4559#issue-1292915844 for more details.
