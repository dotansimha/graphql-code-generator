/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type AllFilmsWithVariablesQueryQueryVariables = Exact<{
  first: Scalars['Int']['input'];
}>;

export type AllFilmsWithVariablesQueryQuery = {
  __typename?: 'Root';
  allFilms?: {
    __typename?: 'FilmsConnection';
    edges?: Array<{
      __typename?: 'FilmsEdge';
      node?: ({ __typename?: 'Film' } & { ' $fragmentRefs'?: { FilmItemFragment: FilmItemFragment } }) | null;
    } | null> | null;
  } | null;
};

export type FilmItemFragment = {
  __typename?: 'Film';
  id: string;
  title?: string | null;
  releaseDate?: string | null;
  producers?: Array<string | null> | null;
} & { ' $fragmentName'?: 'FilmItemFragment' };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: Record<string, any> | undefined) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const FilmItemFragmentDoc = new TypedDocumentString(
  `
    fragment FilmItem on Film {
  id
  title
  releaseDate
  producers
}
    `,
  { fragmentName: 'FilmItem' }
) as unknown as TypedDocumentString<FilmItemFragment, unknown>;
export const AllFilmsWithVariablesQueryDocument = new TypedDocumentString(`
    query allFilmsWithVariablesQuery($first: Int!) {
  allFilms(first: $first) {
    edges {
      node {
        ...FilmItem
      }
    }
  }
}
    fragment FilmItem on Film {
  id
  title
  releaseDate
  producers
}`) as unknown as TypedDocumentString<AllFilmsWithVariablesQueryQuery, AllFilmsWithVariablesQueryQueryVariables>;
