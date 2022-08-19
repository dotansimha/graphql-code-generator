/* eslint-disable */
import * as graphql from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
    "\n    query allFilmsWithVariablesQuery($first: Int!) {\n      allFilms(first: $first) {\n        edges {\n          node {\n            # ...FilmItem\n            id\n            title\n            releaseDate\n          }\n        }\n      }\n    }\n  ": graphql.AllFilmsWithVariablesQueryDocument,
};

export function gql(source: "\n    query allFilmsWithVariablesQuery($first: Int!) {\n      allFilms(first: $first) {\n        edges {\n          node {\n            # ...FilmItem\n            id\n            title\n            releaseDate\n          }\n        }\n      }\n    }\n  "): (typeof documents)["\n    query allFilmsWithVariablesQuery($first: Int!) {\n      allFilms(first: $first) {\n        edges {\n          node {\n            # ...FilmItem\n            id\n            title\n            releaseDate\n          }\n        }\n      }\n    }\n  "];

export function gql(source: string): unknown;
export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;