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

export type AllPeopleQueryQueryVariables = Exact<{ [key: string]: never }>;

export type AllPeopleQueryQuery = {
  __typename?: 'Root';
  allPeople?: {
    __typename?: 'PeopleConnection';
    edges?: Array<{
      __typename?: 'PeopleEdge';
      node?: {
        __typename?: 'Person';
        name?: string | null;
        homeworld?: { __typename?: 'Planet'; name?: string | null } | null;
      } | null;
    } | null> | null;
  } | null;
};

export type AllPeopleWithVariablesQueryQueryVariables = Exact<{
  first: Scalars['Int']['input'];
}>;

export type AllPeopleWithVariablesQueryQuery = {
  __typename?: 'Root';
  allPeople?: {
    __typename?: 'PeopleConnection';
    edges?: Array<{
      __typename?: 'PeopleEdge';
      node?: {
        __typename?: 'Person';
        name?: string | null;
        homeworld?: { __typename?: 'Planet'; name?: string | null } | null;
      } | null;
    } | null> | null;
  } | null;
};

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
