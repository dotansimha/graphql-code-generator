/* eslint-disable */
import * as graphql from './graphql.js';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
  '\nquery AllPeopleQuery {\n  allPeople(first: 5) {\n    edges {\n      node {\n        name\n        homeworld {\n          name\n        }\n      }\n    }\n  }\n}\n\n':
    graphql.AllPeopleQueryDocument,
  '\nquery AllPeopleWithVariablesQuery($first: Int!) {\n  allPeople(first: $first) {\n    edges {\n      node {\n        name\n        homeworld {\n          name\n        }\n      }\n    }\n  }\n}\n':
    graphql.AllPeopleWithVariablesQueryDocument,
};

export function gql(
  source: '\nquery AllPeopleQuery {\n  allPeople(first: 5) {\n    edges {\n      node {\n        name\n        homeworld {\n          name\n        }\n      }\n    }\n  }\n}\n\n'
): typeof documents['\nquery AllPeopleQuery {\n  allPeople(first: 5) {\n    edges {\n      node {\n        name\n        homeworld {\n          name\n        }\n      }\n    }\n  }\n}\n\n'];
export function gql(
  source: '\nquery AllPeopleWithVariablesQuery($first: Int!) {\n  allPeople(first: $first) {\n    edges {\n      node {\n        name\n        homeworld {\n          name\n        }\n      }\n    }\n  }\n}\n'
): typeof documents['\nquery AllPeopleWithVariablesQuery($first: Int!) {\n  allPeople(first: $first) {\n    edges {\n      node {\n        name\n        homeworld {\n          name\n        }\n      }\n    }\n  }\n}\n'];

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
