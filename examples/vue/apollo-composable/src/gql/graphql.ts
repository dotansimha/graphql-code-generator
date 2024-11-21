/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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

export type AllFilmsWithVariablesQueryQueryVariables = Exact<{
  first: Scalars['Int']['input'];
}>;

export type AllFilmsWithVariablesQueryQuery = {
  __typename?: 'Root';
  allFilms?: {
    __typename?: 'FilmsConnection';
    edges?: Array<{
      __typename?: 'FilmsEdge';
      node?: ({ __typename?: 'Film' } & { ' $fragmentRefs'?: { FilmItemFragment: FilmItemFragment } }) | null;
    } | null> | null;
  } | null;
};

export type FilmItemFragment = {
  __typename?: 'Film';
  id: string;
  title?: string | null;
  releaseDate?: string | null;
  producers?: Array<string | null> | null;
} & { ' $fragmentName'?: 'FilmItemFragment' };

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
