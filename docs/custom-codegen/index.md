---
id: index
title: What are Plugins?
---

The general purpose of GraphQL Code Generator is to parse GraphQL syntax, transform it into an AST and then output it into desired formats which can vary. Since there can be potentially infinite amount of formats, we've made it possible to build custom code generators.

The code generators are simply handlers which will respond to the parsed data and will output it based on your implementation.

GraphQL Code Generator triggers plugins with `GraphQLSchema` object, GraphQL documents and the configuration the user has passed, and expects them to return `string` (or, `Promise<string>`) and then it appends this value to the output.

Writing your own plugins could be useful for things such as new language tempalte, customizing existing plugin, adding custom context to output files and more.

It's easy to write and test codegen plugins, and you can learn how to write your own.
