import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import * as graphql from './graphql.js';

const documents = {
  '\n  query AllPeopleQuery {\n    allPeople(first: 5) {\n      edges {\n        node {\n          name\n          homeworld {\n            name\n          }\n        }\n      }\n    }\n  }\n':
    graphql.AllPeopleQueryDocument,
  '\n  query AllPeopleWithVariablesQuery($first: Int!) {\n    allPeople(first: $first) {\n      edges {\n        node {\n          name\n          homeworld {\n            name\n          }\n        }\n      }\n    }\n  }\n':
    graphql.AllPeopleWithVariablesQueryDocument,
};

export function gql(
  source: '\n  query AllPeopleQuery {\n    allPeople(first: 5) {\n      edges {\n        node {\n          name\n          homeworld {\n            name\n          }\n        }\n      }\n    }\n  }\n'
): typeof documents['\n  query AllPeopleQuery {\n    allPeople(first: 5) {\n      edges {\n        node {\n          name\n          homeworld {\n            name\n          }\n        }\n      }\n    }\n  }\n'];
export function gql(
  source: '\n  query AllPeopleWithVariablesQuery($first: Int!) {\n    allPeople(first: $first) {\n      edges {\n        node {\n          name\n          homeworld {\n            name\n          }\n        }\n      }\n    }\n  }\n'
): typeof documents['\n  query AllPeopleWithVariablesQuery($first: Int!) {\n    allPeople(first: $first) {\n      edges {\n        node {\n          name\n          homeworld {\n            name\n          }\n        }\n      }\n    }\n  }\n'];

export function gql(source: string): unknown;
export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
  infer TType,
  any
>
  ? TType
  : never;
