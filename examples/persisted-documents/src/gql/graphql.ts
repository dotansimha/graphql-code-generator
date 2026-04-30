import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

export type HelloQueryQueryVariables = Exact<{ [key: string]: never }>;

export type HelloQueryQuery = { hello: string };

export const HelloQueryDocument = {
  __meta__: { hash: 'sha256:4c3f5d98b02279859b4c0c4efdba9553ac7acf89b9b0785eb24be68d5a67e6e8' },
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'HelloQuery' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'hello' } }],
      },
    },
  ],
} as unknown as DocumentNode<HelloQueryQuery, HelloQueryQueryVariables>;
