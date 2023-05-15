/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import gql from 'gql';

//@ts-ignore
const A1 = gql`
  query a {
    a
  }
`;

//@ts-ignore
// Without using template literal, we can force a one-line query as a test case
const A2 = gql(`query a { a }`);
