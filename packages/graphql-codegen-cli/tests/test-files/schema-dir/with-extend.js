const { buildSchema } = require('graphql');

const schema = buildSchema(/* GraphQL */ `
  type User {
    a: String
  }

  type Query {
    user: User
  }

  extend type Query {
    hello: String
  }
`);

module.exports = schema;
