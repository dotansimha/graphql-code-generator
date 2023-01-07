import { parser } from 'custom-graphql-parser';
import { graphql } from 'gatsby';
import gql from 'graphql-tag';

export const fragmentA = gql`
  fragment FragmentA on MyType {
    fieldC
  }
`;

export const fragmentB = graphql`
  fragment FragmentB on MyType {
    fieldC
  }
`;

export const fragmentC = parser`
  fragment FragmentC on MyType {
    fieldC
  }
`;
