/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
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

export type Query = {
  __typename?: 'Query';
  alphabet: Array<Scalars['String']['output']>;
  /** A field that resolves fast. */
  fastField: Scalars['String']['output'];
  /**
   * A field that resolves slowly.
   * Maybe you want to @defer this field ;)
   */
  slowField: Scalars['String']['output'];
};

export type QuerySlowFieldArgs = {
  waitFor?: Scalars['Int']['input'];
};

export type SlowFieldFragmentFragment = { __typename?: 'Query'; slowField: string } & {
  ' $fragmentName'?: 'SlowFieldFragmentFragment';
};

export type SlowAndFastFieldWithDeferQueryVariables = Exact<{ [key: string]: never }>;

export type SlowAndFastFieldWithDeferQuery = { __typename?: 'Query'; fastField: string } & (
  | { __typename?: 'Query'; inlinedSlowField: string }
  | { __typename?: 'Query'; inlinedSlowField?: never }
) &
  ({ __typename?: 'Query' } & {
    ' $fragmentRefs'?: { SlowFieldFragmentFragment: Incremental<SlowFieldFragmentFragment> };
  });

export const SlowFieldFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'SlowFieldFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Query' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'slowField' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'waitFor' },
                value: { kind: 'IntValue', value: '5000' },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SlowFieldFragmentFragment, unknown>;
export const SlowAndFastFieldWithDeferDocument = {
  __meta__: { deferredFields: { SlowFieldFragment: ['slowField'] } },
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
            kind: 'FragmentSpread',
            name: { kind: 'Name', value: 'SlowFieldFragment' },
            directives: [{ kind: 'Directive', name: { kind: 'Name', value: 'defer' } }],
          },
          {
            kind: 'InlineFragment',
            directives: [{ kind: 'Directive', name: { kind: 'Name', value: 'defer' } }],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'inlinedSlowField' },
                  name: { kind: 'Name', value: 'slowField' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'waitFor' },
                      value: { kind: 'IntValue', value: '5000' },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'SlowFieldFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Query' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'slowField' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'waitFor' },
                value: { kind: 'IntValue', value: '5000' },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SlowAndFastFieldWithDeferQuery, SlowAndFastFieldWithDeferQueryVariables>;
