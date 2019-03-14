---
id: using-visitor
title: Visitor Pattern
---

Most of the codegen's plugins are written with a design-pattern called [Visitor](https://en.wikipedia.org/wiki/Visitor_pattern). GraphQL has an internal mechanism for "visiting" a GraphQLSchema and GraphQL operations, and you can use it to transform your GraphQL definitions into a custom output.

With visitor pattern you can call a custom function on each AST node, and transform it into something else.

You can use [ASTExplorer](https://astexplorer.net/) and see how does GraphQL represents it's definitions in a JSON structure, and you can also use this to understand which function will be called each time.

In [graphql.org](https://graphql.org/graphql-js/language/#visit) you can find the exact API documentation we are going to use in this section.

## Basic Visitor

In this example, we will transform a basic type definition into a list of types and fields:

From:

```graphql
type MyType {
  myField: String!
}

type MyOtherType {
  myOtherField: Int!
}
```

To

```
MyType.myField
MyOtherType.myOtherField
```

To get started with a basic visitor, start by extracting the `astNode` of your `GraphQLSchema`:

```javascript
const { printSchema, parse } = require('graphql');

module.exports = {
  plugin: (schema, documents, config) => {
    const printedSchema = printSchema(schema); // Returns a string representation of the schema
    const astNode = parse(printedSchema); // Transforms the string into ASTNode
  }
};
```

> Note: if you wish to have GraphQL directives when you print your schema, use `printSchemaWithDirectives` from `graphql-toolkit` package.

Then, create your initial visitor, in our case, we would like to transform a `FieldDefinition` and `ObjectTypeDefinition`, so let's create an object with a stub definitions, an use `visit` to run it:

```javascript
const { printSchema, parse, visit } = require('graphql');

module.exports = {
  plugin: (schema, documents, config) => {
    const printedSchema = printSchema(schema); // Returns a string representation of the schema
    const astNode = parse(printedSchema); // Transforms the string into ASTNode
    const visitor = {
      FieldDefinition: node => {
        // This function triggered per each field
      },
      ObjectTypeDefinition: node => {
        // This function triggered per each type
      }
    };

    const result = visit(astNode, { leave: visitor });

    return result.definitions.join('\n');
  }
};
```

Now, let's implement `ObjectTypeDefinition` and `FieldDefinition`:

```javascript
const { printSchema, parse, visit } = require('graphql');

module.exports = {
  plugin: (schema, documents, config) => {
    const printedSchema = printSchema(schema); // Returns a string representation of the schema
    const astNode = parse(printedSchema); // Transforms the string into ASTNode
    const visitor = {
      FieldDefinition: node => {
        // Transform the field AST node into a string, containing only the name of the field
        return node.name.value;
      },
      ObjectTypeDefinition: node => {
        // "node.fields" is an array of strings, because we transformed it using "FieldDefinition".
        return node.fields.map(field => `${node.name.value}.${field}`).join('\n');
      }
    };

    const result = visit(astNode, { leave: visitor });

    return result.definitions.join('\n');
  }
};
```

## Codegen and Visitors

This repository also contains a set of utils that might help you to write plugins faster using visitor pattern.

All those utils are part of `graphql-codegen-visitor-plugin-common` package.

It includes set of Visitor classes that you can use and extend, to implement your plugin easily:

- `BaseVisitor` is a class that contains a very basic implementation and utils for plugin configuration, and let you easily implement plugins that compatiable with `namingConvention` and `scalars` configuration. [Here you can find an example for using it](https://github.com/dotansimha/graphql-code-generator/blob/6f2999993315815e4625941b7a1a7d2fe035beb0/packages/plugins/typescript-mongodb/src/visitor.ts#L56).

- `BaseTypesVisitor` is a class that contains implementation for converting types, interfaces, unions, enums and fields. It's the base implementation for [`flow`](https://github.com/dotansimha/graphql-code-generator/blob/6f2999993315815e4625941b7a1a7d2fe035beb0/packages/plugins/flow/src/visitor.ts#L26) and [`typescript`](https://github.com/dotansimha/graphql-code-generator/blob/6f2999993315815e4625941b7a1a7d2fe035beb0/packages/plugins/typescript/src/visitor.ts#L23) plugins.

- `BaseResolversVisitor` is a class that contains implementation for generating a resolvers signature, it's the base implementation for [`flow-resolvers`](https://github.com/dotansimha/graphql-code-generator/blob/6f2999993315815e4625941b7a1a7d2fe035beb0/packages/plugins/flow-resolvers/src/visitor.ts#L13) and [`typescript-resolvers`](https://github.com/dotansimha/graphql-code-generator/blob/6f2999993315815e4625941b7a1a7d2fe035beb0/packages/plugins/typescript-resolvers/src/visitor.ts#L13)

- `BaseDocumentsVisitor` is class that contains implementation for transforming GraphQL operations (query/mutation/subscription/fragment) with a resursive handler for selection-sets. It's the base implementation for [`flow-operations`](https://github.com/dotansimha/graphql-code-generator/blob/6f2999993315815e4625941b7a1a7d2fe035beb0/packages/plugins/flow-operations/src/visitor.ts) and [`typescript-operations`](https://github.com/dotansimha/graphql-code-generator/blob/6f2999993315815e4625941b7a1a7d2fe035beb0/packages/plugins/typescript-operations/src/visitor.ts)

- `ClientSideBaseVisitor` is a class that contains implementation for creating client-side code for consuming GraphQL operations, it's in use by `typescript-apollo-angular`, `typescript-react-apollo` and `typescript-apollo-stencil` plugins.

You can use the above classes as base, and extend it as you wish, to create a custom plugin.
