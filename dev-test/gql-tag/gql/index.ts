/* eslint-disable */
import * as graphql from './graphql';

const documents = {
  '\n  query Foo {\n    Tweets {\n      id\n    }\n  }\n': graphql.FooDocument,
  '\n  fragment Lel on Tweet {\n    id\n    body\n  }\n': graphql.LelFragmentDoc,
  '\n  query Bar {\n    Tweets {\n      ...Lel\n    }\n  }\n': graphql.BarDocument,
};

export function gql(
  source: '\n  query Foo {\n    Tweets {\n      id\n    }\n  }\n'
): typeof documents['\n  query Foo {\n    Tweets {\n      id\n    }\n  }\n'];
export function gql(
  source: '\n  fragment Lel on Tweet {\n    id\n    body\n  }\n'
): typeof documents['\n  fragment Lel on Tweet {\n    id\n    body\n  }\n'];
export function gql(
  source: '\n  query Bar {\n    Tweets {\n      ...Lel\n    }\n  }\n'
): typeof documents['\n  query Bar {\n    Tweets {\n      ...Lel\n    }\n  }\n'];

export function gql(source: string): unknown;
export function gql(source: string) {
  return (documents as any)[source] ?? {};
}
