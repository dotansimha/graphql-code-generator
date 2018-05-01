# Writing Custom Templates

If you with to write a custom template, you can either use one of the following options:

## Write you own template package

To write you own template package using Handlebars, you can use [`codegen-handlebars-templates-scripts`](https://github.com/dotansimha/graphql-code-generator/blob/60f66697c32a3ddeff2d51413131cba6620294e5/packages/scripts/handlebars-templates-scripts/README.md).

## Write your own output processor

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

* `templateContext` is the GraphQL Codegen context object - which is your `GraphQLSchema` in an easy-to-use structure ([see `types.ts` file for more info](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-core/src/types.ts#L78))
* `mergedDocuments` is all the GraphQL documents (query/mutation/subscription/fragment) that the codegen could find
* `settings` is an object of settings - these are matching to the cli options.

This is an example for a custom function written in pure JS:

```js
module.exports = function(context, documents, settings) {
  return [{ filename: 'a.ts', content: '1' }];
};
```

## Integrate GraphQL Codegen into your project code

You can also integrate the GraphQL Code Generator into your project's code and generate multiple files using templates that are part of your project.

You can [read more about it here](INPUT_TYPE_PROJECT.md).
