/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Mutation = {
  __typename?: 'Mutation';
  echo: Scalars['String'];
};

export type MutationEchoArgs = {
  message: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  hello: Scalars['String'];
};

export type HelloQueryQueryVariables = Exact<{ [key: string]: never }>;

export type HelloQueryQuery = { __typename?: 'Query'; hello: string };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: { hash: string }) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const HelloQueryDocument = new TypedDocumentString(
  `
    query HelloQuery {
  hello
}
    `,
  { hash: '86f01e23de1c770cabbc35b2d87f2e5fd7557b6f' }
) as unknown as TypedDocumentString<HelloQueryQuery, HelloQueryQueryVariables>;
