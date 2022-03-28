---
id: index
title: What are Plugins?
---

The general purpose of GraphQL Code Generator is to parse GraphQL syntax, transform it into an AST and then output it into desired formats which can vary.

Since there can be a potentially infinite amount of formats, we've made it possible to build custom plugins.


Plugins are handlers who respond to the parsed data, and output is based on your implementation.

GraphQL Code Generator triggers plugins with `GraphQLSchema` object, GraphQL documents, and the configuration the user has passed and expects them to return `string` (or `Promise<string>`), and then it appends this value to the output.

Writing your plugins could be helpful for things such as new language templates, customizing existing plugins, and adding custom context to output files.

It's easy to write and test codegen plugins, and you can learn how to write your own.
