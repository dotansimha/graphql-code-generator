---
id: function
title: Custom Code Generating Function
---

To define a custom code generating function, create a `.js` file under your project's dir, and export a function with the following signature:

```typescript
(templateContext: SchemaTemplateContext, mergedDocuments: Document, settings: any) => FileOutput[] | Promise<FileOutput[]>;
```

**Parameters**

The function's parameters represent the parsed data by GraphQL Code Generator.

- `templateContext` - An AST representation of your GraphQL schema (see [interface](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L98)).
- `mergedDocuments` - A set of GraphQL documents which were fetched by the codegen (`query/mutation/subscription/fragment`).
- `settings` - An object whose schema matches possible CLI options.

**Returns** - An array of `FileOutput` or a promise which returns an array (see [interface](https://github.com/dotansimha/graphql-code-generator/blob/6e18acb1dc9c8c261d26ef2614b3bbf03fbc9492/packages/graphql-codegen-core/src/types.ts#L296)).

**Example**

```js
module.exports = function(context, documents, settings) {
  return [{ filename: 'a.ts', content: '1' }];
};
```

Note that it's also possible to use other languages but then you need to make sure to compile it to a binary file first and then use the [`--require` flag](https://gist.github.com/jamestalmage/df922691475cff66c7e6).