/* eslint-disable @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/ban-ts-comment */
//@ts-ignore
import gql from 'gql-tag';

//@ts-ignore
const A = gql(/* GraphQL */ `
  query A {
    a
  }
`);

//@ts-ignore
const B = gql(/* GraphQL */ `
  query B {
    b
  }
`);

//@ts-ignore
const C = gql(/* GraphQL */ `
  fragment C on Query {
    c
  }
`);
