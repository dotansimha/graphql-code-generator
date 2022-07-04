---
'@graphql-codegen/cli': patch
---

Bumps @graphql-tools/url-loader that has the latest cross-undici-fetch dependency to fix the bug happens when `undici@5.6.0` resolved an inner dependency and the user gets an error like `GET/HEAD requests cannot have 'body'`.
See https://github.com/ardatan/graphql-tools/pull/4559#issue-1292915844 for more details.
