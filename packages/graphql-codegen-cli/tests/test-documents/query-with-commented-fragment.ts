import gql from 'graphql-tag';

export const myFragment = gql`
  fragment MyFragment on MyType {
    fieldC
  }
`;

// export const myFragment = gql`
//   fragment MyFragment on MyType {
//     fieldC
//   }
// `;

export const query = gql`
  query myQuery {
    fieldB {
      ...MyFragment
    }
  }
  ${myFragment}
`;
