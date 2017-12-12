const introspectionSchema = require("./schema.json");
const GraphQL = require("graphql");
module.exports.default = GraphQL.buildClientSchema(introspectionSchema);
