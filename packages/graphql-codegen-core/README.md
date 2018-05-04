# `graphql-codegen-core`

This package is in charge of converting `GraphQLSchema` and GraphQL client-side operations (query/mutation/subscription/fragment) into a template consumable JSON structure.

The entry points of this package are:

* `schemaToTemplateContext` - transforms `GraphQLSchema` into [`SchemaTemplateContext`](./src/types.ts#L78-L94) object.
* `transformDocument` - transforms GraphQL `DocumentNode` (object that can contains multiple GraphQL operations and fragments) to [`Document`](./src/types.ts#L195-L200).

The purpose of the transformation is to simplify the links and connections between the GraphQL entities, and to add template indicators (`has...`, `is...`, `uses...`) to the context.

## Build process

The build process of this package is based on TypeScript and compiled with `typescript` compiler.

To build this package, start by installing the package dependencies:

```
   $ npm install
   // Or, with Yarn
   $ yarn
```

Then, you can use the existing NPM scripts to build the package:

```
    $ npm build
    // Or, with Yarn
    $ yarn build
```
