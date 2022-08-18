/* eslint-disable */
import * as types from './graphql.js';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
  '\n  query Foo {\n    Tweets {\n      id\n    }\n  }\n': types.FooDocument,
  '\n  fragment Lel on Tweet {\n    id\n    body\n  }\n': types.LelFragmentDoc,
  '\n  query Bar {\n    Tweets {\n      ...Lel\n    }\n  }\n': types.BarDocument,
};

export function graphql(
  source: '\n  query Foo {\n    Tweets {\n      id\n    }\n  }\n'
): typeof documents['\n  query Foo {\n    Tweets {\n      id\n    }\n  }\n'];
export function graphql(
  source: '\n  fragment Lel on Tweet {\n    id\n    body\n  }\n'
): typeof documents['\n  fragment Lel on Tweet {\n    id\n    body\n  }\n'];
export function graphql(
  source: '\n  query Bar {\n    Tweets {\n      ...Lel\n    }\n  }\n'
): typeof documents['\n  query Bar {\n    Tweets {\n      ...Lel\n    }\n  }\n'];

export function graphql(source: string): unknown;
export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
  infer TType,
  any
>
  ? TType
  : never;
