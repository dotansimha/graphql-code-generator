---
'@graphql-codegen/gql-tag-operations-preset': patch
---

use [`template.smart`](https://babeljs.io/docs/en/babel-template#templatesmart) instead of default import which should fix bable plugin loading issues in `vite`
