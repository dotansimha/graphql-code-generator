import gql from 'graphql-tag';

export const myFragment = gql`
  fragment MyFragment on MyType {
    fieldC
  }
`;

export const myFragment2 = gql`
  fragment MyFragment2 on DType {
    field1
  }
`;

export const myFragment3 = gql`
  fragment MyFragment3 on DType {
    field2
  }
`;
