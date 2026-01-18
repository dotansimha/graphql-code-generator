/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type FooQueryVariables = Exact<{ [key: string]: never }>;

export type FooQuery = { Tweets: Array<{ id: string } | null> | null };

export type LelFragment = { id: string; body: string | null } & { ' $fragmentName'?: 'LelFragment' };

export type BarQueryVariables = Exact<{ [key: string]: never }>;

export type BarQuery = { Tweets: Array<{ ' $fragmentRefs'?: { LelFragment: LelFragment } } | null> | null };

export const LelFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'Lel' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LelFragment, unknown>;
export const FooDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Foo' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'Tweets' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FooQuery, FooQueryVariables>;
export const BarDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Bar' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'Tweets' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Lel' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'Lel' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BarQuery, BarQueryVariables>;
