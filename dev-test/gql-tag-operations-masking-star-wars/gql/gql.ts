/* eslint-disable */
import * as types from './graphql.js';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
  '\n  query HeroDetailsWithFragment($episode: Episode) {\n    hero(episode: $episode) {\n      ...HeroDetails\n    }\n  }\n':
    types.HeroDetailsWithFragmentDocument,
  '\n  fragment HeroDetails on Character {\n    __typename\n    name\n    ... on Human {\n      height\n    }\n    ... on Droid {\n      primaryFunction\n    }\n  }\n':
    types.HeroDetailsFragmentDoc,
};

export function gql(
  source: '\n  query HeroDetailsWithFragment($episode: Episode) {\n    hero(episode: $episode) {\n      ...HeroDetails\n    }\n  }\n'
): typeof documents['\n  query HeroDetailsWithFragment($episode: Episode) {\n    hero(episode: $episode) {\n      ...HeroDetails\n    }\n  }\n'];
export function gql(
  source: '\n  fragment HeroDetails on Character {\n    __typename\n    name\n    ... on Human {\n      height\n    }\n    ... on Droid {\n      primaryFunction\n    }\n  }\n'
): typeof documents['\n  fragment HeroDetails on Character {\n    __typename\n    name\n    ... on Human {\n      height\n    }\n    ... on Droid {\n      primaryFunction\n    }\n  }\n'];

export function gql(source: string): unknown;
export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
  infer TType,
  any
>
  ? TType
  : never;
