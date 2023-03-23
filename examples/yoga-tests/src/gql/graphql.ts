/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Empty<T> = { [P in keyof T]?: never };
export type Incremental<T> = T & { ' $defer': true };
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

export type EchoMutationMutationVariables = Exact<{
  message: Scalars['String'];
}>;

export type EchoMutationMutation = { __typename?: 'Mutation'; echo: string };

export const HelloQueryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'HelloQuery' },
      selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'hello' } }] },
    },
  ],
} as unknown as DocumentNode<HelloQueryQuery, HelloQueryQueryVariables>;
export const EchoMutationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'EchoMutation' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'message' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'echo' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'message' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'message' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EchoMutationMutation, EchoMutationMutationVariables>;
