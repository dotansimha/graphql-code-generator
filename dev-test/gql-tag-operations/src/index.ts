/* eslint-disable @typescript-eslint/no-unused-vars */

import { graphql, DocumentType } from '../gql/gql.js';

const FooQuery = graphql(/* GraphQL */ `
  query Foo {
    Tweets {
      id
    }
  }
`);

const LelFragment = graphql(/* GraphQL */ `
  fragment Lel on Tweet {
    id
    body
  }
`);

const BarQuery = graphql(/* GraphQL */ `
  query Bar {
    Tweets {
      ...Lel
    }
  }
`);

const doSth = (params: { lel: DocumentType<typeof LelFragment> }) => {
  params.lel.id;
};
