/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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

export type Query = {
  __typename?: 'Query';
  alphabet: Array<Scalars['String']>;
  /** A field that resolves fast. */
  fastField: Scalars['String'];
  /**
   * A field that resolves slowly.
   * Maybe you want to @defer this field ;)
   */
  slowField: Scalars['String'];
};

export type QuerySlowFieldArgs = {
  waitFor?: Scalars['Int'];
};

export type SlowAndFastFieldWithDeferQueryVariables = Exact<{ [key: string]: never }>;

export type SlowAndFastFieldWithDeferQuery = { __typename?: 'Query'; fastField: string } & (
  | { __typename?: 'Query'; slowField: string }
  | { __typename?: 'Query'; slowField?: never }
);

export const SlowAndFastFieldWithDeferDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SlowAndFastFieldWithDefer' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'fastField' } },
          {
            kind: 'InlineFragment',
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Query' } },
            directives: [{ kind: 'Directive', name: { kind: 'Name', value: 'defer' } }],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'slowField' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SlowAndFastFieldWithDeferQuery, SlowAndFastFieldWithDeferQueryVariables>;
