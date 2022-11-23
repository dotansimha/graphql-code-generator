/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

declare module '@urql/core' {
  /**
   * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
   */
  export function gql(
    source: '\n  query Foo {\n    Tweets {\n      id\n    }\n  }\n'
  ): typeof import('./graphql.js').FooDocument;
  /**
   * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
   */
  export function gql(
    source: '\n  fragment Lel on Tweet {\n    id\n    body\n  }\n'
  ): typeof import('./graphql.js').LelFragmentDoc;
  /**
   * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
   */
  export function gql(
    source: '\n  query Bar {\n    Tweets {\n      ...Lel\n    }\n  }\n'
  ): typeof import('./graphql.js').BarDocument;
  export function gql(source: string): unknown;

  export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
    infer TType,
    any
  >
    ? TType
    : never;
}
