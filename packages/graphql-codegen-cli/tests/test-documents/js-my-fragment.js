import gql from 'graphql-tag';

export const myFragment = gql`
  fragment MyFragment on MyType {
    fieldC
  }
`;
