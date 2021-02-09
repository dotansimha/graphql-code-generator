---
id: gatsby
title: GatsbyJS
---

If you are building apps using [GatsbyJS](https://www.gatsbyjs.org/), you can use GraphQL Code Generator to generate TypeScript types.

The codegen knows automatically to look for the import of the `graphql` tag for `gatsby` package.

Using the following config file, it should cover everything specific to Gastby:

```yml
schema: http://localhost:8000/___graphql
documents:
  - ./src/**/*.{ts,tsx}
  - ./node_modules/gatsby*/!(node_modules)/**/*.js
generates:
  ./src/graphqlTypes.ts:
    plugins:
      - typescript
      - typescript-operations
```

Now, the codegen should be able to load your GraphQL operations from your source code, and also load all the internal fragments from `node_modules`.

:::caution Note on `documents` section

The glob expression above should get you started quickly, but note that it's very broad and might load many files that matches the `./node_modules/gatsby*/!(node_modules)/**/*.js` pattern. 
If you are having issues with this glob expression, or if you are seeing performance issues, please note that you need to narrow this expression to the bare minimum that is being loaded by your Gatsby instance.

[This issue might help](https://github.com/dotansimha/graphql-code-generator/issues/5024)

:::

## Community Plugins

There are also community Gatsby plugins that integrate with @graphl-codegen:

- [gatsby-plugin-graphql-codegen](https://github.com/d4rekanguok/gatsby-typescript/tree/master/packages/gatsby-plugin-graphql-codegen)
- [gatsby-plugin-typegen](https://github.com/cometkim/gatsby-plugin-typegen)
