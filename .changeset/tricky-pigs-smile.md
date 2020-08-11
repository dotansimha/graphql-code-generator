---
'@graphql-codegen/typescript-react-apollo': patch
---

Improve output reliability by using separate import for gql tag, ensuring it will be there also for fragments when presets are used. This will bring back the separate import for gql tag (and remove the aliased one)
