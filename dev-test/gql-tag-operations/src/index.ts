/* eslint-disable @typescript-eslint/no-unused-vars */

import { gql, DocumentType } from '../gql.js';

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

const doSth = (params: { lel: DocumentType<typeof LelFragment> }) => {
  params.lel.id;
};
