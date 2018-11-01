---
id: integration
title: Project Integration
---

GraphQL codegen supports custom user-defined templates. There are possible ways to do so:

- [Writing a custom template as an `npm` package.](./package)
- [Writing a custom template as a post-processor function.](./post-processor)

This code generator also supports a custom output generators.

You can either do it by writing your own JavaScript file that exports the processing function, or put it inside NPM package.

To start writing your custom processor, create a JavaScript (or other language, but compile it or use `--require` flag) under you project.

Your file must export a function, and need to return `FileOutput[]` (or a `Promise<FileOutput[]>`):

```typescript
interface FileOutput {
  filename: string;
  content: string;
}
```

Your function need to match the following signature:

```typescript
(templateContext: SchemaTemplateContext, mergedDocuments: Document, settings: any) => FileOutput[] | Promise<FileOutput[]>;
```

- `templateContext` is the GraphQL Codegen context object - which is your `GraphQLSchema` in an easy-to-use structure ([see `types.ts` file for more info](../../packages/graphql-codegen-core/src/types.ts#L78))
- `mergedDocuments` is all the GraphQL documents (query/mutation/subscription/fragment) that the codegen could find
- `settings` is an object of settings - these are matching to the cli options.

This is an example for a custom function written in pure JS:

```js
module.exports = function(context, documents, settings) {
  return [{ filename: 'a.ts', content: '1' }];
};
```
