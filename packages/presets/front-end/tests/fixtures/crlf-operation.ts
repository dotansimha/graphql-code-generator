/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import gql from 'gql-tag';

//@ts-ignore
const A = gql(/* GraphQL */ `
  query a {
    a
  }
`);

//@ts-ignore
const B = gql(/* GraphQL */ `
  query b {
    b
  }
`);

//@ts-ignore
const C = gql(/* GraphQL */ `
  fragment C on Query {
    c
  }
`);
