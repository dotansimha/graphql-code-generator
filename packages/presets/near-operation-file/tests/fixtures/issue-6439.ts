import { gql } from 'graphql-request';

export const C = gql`
  query A {
    a
  }
`;

export const B = gql`
  query B {
    a
  }
`;

export const A = gql`
  query C {
    a
  }
`;
