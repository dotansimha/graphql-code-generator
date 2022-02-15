/* eslint-disable */
import * as graphql from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
  '\n  fragment TweetFragment on Tweet {\n    id\n    body\n    ...TweetAuthorFragment\n  }\n':
    graphql.TweetFragmentFragmentDoc,
  '\n  fragment TweetAuthorFragment on Tweet {\n    id\n    author {\n      id\n      username\n    }\n  }\n':
    graphql.TweetAuthorFragmentFragmentDoc,
  '\n  query TweetsQuery {\n    Tweets {\n      id\n      ...TweetFragment\n    }\n  }\n': graphql.TweetsQueryDocument,
};

export function gql(
  source: '\n  fragment TweetFragment on Tweet {\n    id\n    body\n    ...TweetAuthorFragment\n  }\n'
): typeof documents['\n  fragment TweetFragment on Tweet {\n    id\n    body\n    ...TweetAuthorFragment\n  }\n'];
export function gql(
  source: '\n  fragment TweetAuthorFragment on Tweet {\n    id\n    author {\n      id\n      username\n    }\n  }\n'
): typeof documents['\n  fragment TweetAuthorFragment on Tweet {\n    id\n    author {\n      id\n      username\n    }\n  }\n'];
export function gql(
  source: '\n  query TweetsQuery {\n    Tweets {\n      id\n      ...TweetFragment\n    }\n  }\n'
): typeof documents['\n  query TweetsQuery {\n    Tweets {\n      id\n      ...TweetFragment\n    }\n  }\n'];

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
