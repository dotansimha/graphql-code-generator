/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type AllPeopleQueryQueryVariables = Exact<{ [key: string]: never }>;

export type AllPeopleQueryQuery = {
  __typename?: 'Root';
  allPeople: {
    __typename?: 'PeopleConnection';
    edges: Array<{
      __typename?: 'PeopleEdge';
      node: {
        __typename?: 'Person';
        name: string | null;
        homeworld: { __typename?: 'Planet'; name: string | null } | null;
      } | null;
    } | null> | null;
  } | null;
};

export type AllPeopleWithVariablesQueryQueryVariables = Exact<{
  first: number;
}>;

export type AllPeopleWithVariablesQueryQuery = {
  __typename?: 'Root';
  allPeople: {
    __typename?: 'PeopleConnection';
    edges: Array<{
      __typename?: 'PeopleEdge';
      node: {
        __typename?: 'Person';
        name: string | null;
        homeworld: { __typename?: 'Planet'; name: string | null } | null;
      } | null;
    } | null> | null;
  } | null;
};

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

export const AllPeopleQueryDocument = new TypedDocumentString(`
    query AllPeopleQuery {
  allPeople(first: 5) {
    edges {
      node {
        name
        homeworld {
          name
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AllPeopleQueryQuery, AllPeopleQueryQueryVariables>;
export const AllPeopleWithVariablesQueryDocument = new TypedDocumentString(`
    query AllPeopleWithVariablesQuery($first: Int!) {
  allPeople(first: $first) {
    edges {
      node {
        name
        homeworld {
          name
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AllPeopleWithVariablesQueryQuery, AllPeopleWithVariablesQueryQueryVariables>;
