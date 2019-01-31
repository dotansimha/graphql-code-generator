---
id: extend-schema
title: How to extend the GraphQL Schema?
---

Each plugin can also specify `addToSchema` field, and to extend the `GraphQLSchema` with more types:

```js
module.exports = {
  plugin: (schema, documents, config) => {
    const typesMap = schema.getTypeMap();

    return Object.keys(typesMap).join('\n');
  },
  addToSchema: `
        type MyType { field: String }

        directive @myDirective on OBJECT
    `
};
```

It's useful when you wish to add things like declerative `@directive` to your `GraphQLSchema`, that effects only the output of the codegen.

For example, let's add a custom `@directive` that tells the codegen to ignore a specific `type`:

```js
module.exports = {
  plugin: (schema, documents, config) => {
    const typesMap = schema.getTypeMap();

    return Object.keys(typesMap)
      .filter(typeName => {
        const type = typesMap[typeName];
        const astNode = type.astNode;

        if (astNode && astNode.directives && astNode.directives.find(d => d.name.value === 'ignore')) {
          return false;
        }

        return true;
      })
      .join('\n');
  },
  addToSchema: `
        directive @ignore on OBJECT
    `
};
```
