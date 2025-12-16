/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type AllFilmsWithVariablesQuery199QueryVariables = Exact<{
  first: number;
}>;

export type AllFilmsWithVariablesQuery199Query = {
  __typename?: 'Root';
  allFilms: {
    __typename?: 'FilmsConnection';
    edges: Array<{
      __typename?: 'FilmsEdge';
      node: ({ __typename?: 'Film' } & { ' $fragmentRefs'?: { FilmItemFragment: FilmItemFragment } }) | null;
    } | null> | null;
  } | null;
};

export type FilmItemFragment = {
  __typename?: 'Film';
  id: string;
  title: string | null;
  releaseDate: string | null;
  producers: Array<string | null> | null;
} & { ' $fragmentName'?: 'FilmItemFragment' };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
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
export const AllFilmsWithVariablesQuery199Document = new TypedDocumentString(`
    query allFilmsWithVariablesQuery199($first: Int!) {
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
}`) as unknown as TypedDocumentString<AllFilmsWithVariablesQuery199Query, AllFilmsWithVariablesQuery199QueryVariables>;
