import graphql from 'graphql-tag';

export const myQuery = graphql(`
  query myQuery {
    data {
      field1
      field2
    }
  }
`);
