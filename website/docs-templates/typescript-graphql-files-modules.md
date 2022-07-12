---
id: typescript-graphql-files-modules
---

:::note Webpack Integration
If you wish to have a simpler integration in a Webpack project, use [`graphql-let`](https://github.com/piglovesyou/graphql-let), it uses this plugin behind the scenes, and provides simpler developer experience.
:::

## Pre-Requirements

To use this template, make sure you are using [`graphql-tag/loader`](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader) with Webpack.

{@apiDocs}

## Example

Given that you have a query named `MyQuery` in `my-query.graphql` file, this template will generate the following code:

```ts
declare module '*/my-query.graphql' {
  import { DocumentNode } from 'graphql'
  const MyQuery: DocumentNode

  export { MyQuery }

  export default defaultDocument
}
```

Accordingly, you can import the generated types and use it in your code:

```ts
import myQuery from './my-query.graphql'

// OR

import { myQuery } from './my-query.graphql'
```
