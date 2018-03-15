/**
 * There are four formats the schema can be in:
 * 1. GraphQLSchema object
 * 2. Text (the GraphQL schema language textual format)
 * 3. AST (the GraphQL schema language textual format parsed into an AST)
 * 4. Introspection JSON (result returned by introspection query)
 * 
 * This file imports the textual and introspection json files and
 * exports all four formats to be used in tests.
 */

const GraphQL = require("graphql");
const fs = require('fs');
const path = require('path');
const schemaText = fs.readFileSync(path.join(__dirname, "schema.graphql"), 'utf8');
const schemaObject = GraphQL.buildSchema(schemaText);
const schemaAst = GraphQL.parse(schemaText);
const schemaJson = require("./schema.json");
module.exports.schemaText = schemaText;
module.exports.schemaAst = schemaAst;
module.exports.schemaObject = schemaObject;
module.exports.schemaJson = schemaJson;
