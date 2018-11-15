---
id: index
title: What are Code Generators?
---

The general purpose of GraphQL Code Generator is to parse GraphQL syntax, transform it into an AST and then output it into desired formats which can vary. Since there can be potentially infinite amount of formats, we've made it possible to build custom code generators. The code generators are simply handlers which will respond to the parsed data and will output it based on your implementation.

## Available Code Generation Methods

There are few methods to generate code, each one has a different level of complexity. Below are all possible methods, listed from the most simple to the most robust one:

- [Custom code generating template](./template) - Generate code using a Handlebars template.
- [Custom code generating function](./function) - Generate code using a function which will transform the AST.
- [Custom code generating NPM package](./package) - Export your code generating logic into an external NPM package.
