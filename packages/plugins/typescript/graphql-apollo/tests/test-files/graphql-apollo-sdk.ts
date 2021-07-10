import { ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  add: Scalars['Int'];
};

export type QueryAddArgs = {
  x: Scalars['Int'];
  y: Scalars['Int'];
};

export type AddQueryVariables = Exact<{
  x: Scalars['Int'];
  y: Scalars['Int'];
}>;

export type AddQuery = { __typename?: 'Query' } & Pick<Query, 'add'>;

export const AddDocument = gql`
  query Add($x: Int!, $y: Int!) {
    add(x: $x, y: $y)
  }
`;
export const getSdk = (client: ApolloClient<any>) => ({
  AddQuery(variables: AddQueryVariables) {
    return client.query<AddQuery>({ variables, query: AddDocument });
  },
});
export type SdkType = ReturnType<typeof getSdk>;
