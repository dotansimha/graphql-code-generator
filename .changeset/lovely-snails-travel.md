---
'@graphql-codegen/visitor-plugin-common': major
'@graphql-codegen/typescript-resolvers': major
'@graphql-codegen/plugin-helpers': major
---

BREAKING CHANGE: Improve Federation Entity's resolvers' parent param type: These types were using reference types inline. This makes it hard to handle mappers. The Parent type now all comes from ParentResolverTypes to make handling mappers and parent types simpler.
