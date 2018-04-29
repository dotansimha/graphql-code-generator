var graphql = require('graphql');

var schema = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: graphql.GraphQLString,
        resolve() {
          return 'world';
        }
      }
    }
  })
});

exports['default'] = schema;
module.exports = exports['default'];
