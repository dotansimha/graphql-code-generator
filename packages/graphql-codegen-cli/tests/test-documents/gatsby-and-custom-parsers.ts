import gql from 'graphql-tag';
import { graphql } from 'gatsby';
import { parser } from 'custom-graphql-parser';

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
