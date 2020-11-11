const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql');

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      foo: {
        type: GraphQLString,
        resolve: () => `FOO`,
      },
    },
  }),
});
