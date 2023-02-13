/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
    "\n  query allFilmsWithVariablesQuery($first: Int!) {\n    allFilms(first: $first) {\n      edges {\n        node {\n          ...FilmItem\n        }\n      }\n    }\n  }\n": types.AllFilmsWithVariablesQueryDocument,
    "\n  fragment FilmItem on Film {\n    id\n    title\n    releaseDate\n    producers\n  }\n": types.FilmItemFragmentDoc,
};

export function graphql(source: "\n  query allFilmsWithVariablesQuery($first: Int!) {\n    allFilms(first: $first) {\n      edges {\n        node {\n          ...FilmItem\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query allFilmsWithVariablesQuery($first: Int!) {\n    allFilms(first: $first) {\n      edges {\n        node {\n          ...FilmItem\n        }\n      }\n    }\n  }\n"];
export function graphql(source: "\n  fragment FilmItem on Film {\n    id\n    title\n    releaseDate\n    producers\n  }\n"): (typeof documents)["\n  fragment FilmItem on Film {\n    id\n    title\n    releaseDate\n    producers\n  }\n"];

export function graphql(source: string): unknown;
export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;