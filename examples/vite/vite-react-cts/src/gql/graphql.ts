/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type FilmItemFragment = {
  __typename?: 'Film';
  id: string;
  title: string | null;
  releaseDate: string | null;
  producers: Array<string | null> | null;
} & { ' $fragmentName'?: 'FilmItemFragment' };

export type AllFilmsWithVariablesQueryQueryVariables = Exact<{
  first: number;
}>;

export type AllFilmsWithVariablesQueryQuery = {
  __typename?: 'Root';
  allFilms: {
    __typename?: 'FilmsConnection';
    edges: Array<{
      __typename?: 'FilmsEdge';
      node: ({ __typename?: 'Film' } & { ' $fragmentRefs'?: { FilmItemFragment: FilmItemFragment } }) | null;
    } | null> | null;
  } | null;
};

export const FilmItemFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FilmItem' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Film' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'releaseDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'producers' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FilmItemFragment, unknown>;
export const AllFilmsWithVariablesQueryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'allFilmsWithVariablesQuery' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'allFilms' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'edges' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'node' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'FilmItem' } }],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FilmItem' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Film' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'releaseDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'producers' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AllFilmsWithVariablesQueryQuery, AllFilmsWithVariablesQueryQueryVariables>;
