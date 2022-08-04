/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

declare module '@apollo/client' {
  export function gql(
    source: '\n  query AllPeopleQuery {\n    allPeople(first: 5) {\n      edges {\n        node {\n          name\n          homeworld {\n            name\n          }\n        }\n      }\n    }\n  }\n'
  ): typeof import('./graphql.js').AllPeopleQueryDocument;
  export function gql(
    source: '\n  query AllPeopleWithVariablesQuery($first: Int!) {\n    allPeople(first: $first) {\n      edges {\n        node {\n          name\n          homeworld {\n            name\n          }\n        }\n      }\n    }\n  }\n'
  ): typeof import('./graphql.js').AllPeopleWithVariablesQueryDocument;
  export function gql(source: string): unknown;

  export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
    infer TType,
    any
  >
    ? TType
    : never;
}
