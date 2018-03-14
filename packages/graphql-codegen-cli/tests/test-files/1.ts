import gql from 'graphql-tag';

export const myQuery = gql`
  query myQuery {
    data {
      field1
      field2
    }
  }
`;
