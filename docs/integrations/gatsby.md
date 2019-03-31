---
id: gatsby
title: GatsbyJS
---

If you are building apps using [GatsbyJS](https://www.gatsbyjs.org/), you can intergrate GraphQL Code Generator and use it to generate types.

The codegen knows automatically to look for the import of the `graphql` tag for `gatsby` package.

Using the following config file, it should cover everything specific to Gastby:

```yml
schema: http://localhost:8000/___graphql
documents:
  - ./src/**/*.{ts,tsx}
  - ./node_modules/gatsby-*/**/*.js
generates:
  ./src/graphqlTypes.ts:
    plugins:
      - typescript
      - typescript-operations
```

Now, the codegen should be able to load your GraphQL operations from your source code, and also load all the internal fragments from `node_modules`.
