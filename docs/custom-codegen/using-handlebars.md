---
id: using-handlebars
title: Using Handlebars
---

Most of the plugins we maintain are built with [Handlebars](https://handlebarsjs.com/), because it's easy to use and we can leverage it's helpers and partial features, and reuse parts of the plugins code.

If you wish to use Handlebars, we recommend to use one of the GraphQL Code-Generators internal function, and transform your `GraphQLSchema` and GraphQL documents to Handlebars-ready objects.

You can do it like that:

```js
const { schemaToTemplateContext } = require('graphql-codegen-core');
const { compile } = require('Handlebars');

module.exports = {
  plugin: (schema, documents, config) => {
    const templateContext = schemaToTemplateContext(schema);

    return compile(`{{#each types}} {{ name }} {{/each}}`)(templateContext);
  }
};
```

The `schemaToTemplateContext` method [returns an object, in this structure](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-core/src/types.ts#L98-L114).

You can also do the same for your documents, by doing:

```js
const { schemaToTemplateContext, transformDocumentsFiles } = require('graphql-codegen-core');
const { compile } = require('Handlebars');

module.exports = {
  plugin: (schema, documents, config) => {
    const transformedDocuments = transformDocumentsFiles(schema, documents);

    return compile(`{{#each operations}} {{ name }} {{/each}}`)(transformedDocuments);
  }
};
```

The `transformDocumentsFiles` method [returns an object, in this structure](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-core/src/types.ts#L223-L228).
