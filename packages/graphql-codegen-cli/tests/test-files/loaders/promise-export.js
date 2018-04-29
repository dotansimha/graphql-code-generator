var graphql = require('graphql');

var schema = new Promise(resolve => {
  resolve(
    new graphql.GraphQLSchema({
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
    })
  );
});

module.exports = {
  schema
};
