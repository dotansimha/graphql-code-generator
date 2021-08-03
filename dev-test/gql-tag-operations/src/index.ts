/* eslint-disable @typescript-eslint/no-unused-vars */

import { gql } from '../gql';

const FooQuery = gql(/* GraphQL */ `
  query Foo {
    Tweets {
      id
    }
  }
`);

const LelFragment = gql(/* GraphQL */ `
  fragment Lel on Tweet {
    id
    body
  }
`);

const BarQuery = gql(/* GraphQL */ `
  query Bar {
    Tweets {
      ...Lel
    }
  }
`);
