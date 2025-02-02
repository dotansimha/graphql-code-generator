/* eslint-disable */
import * as types from './graphql.js';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n  fragment TweetFragment on Tweet {\n    id\n    body\n    ...TweetAuthorFragment\n  }\n': typeof types.TweetFragmentFragmentDoc;
  '\n  fragment TweetAuthorFragment on Tweet {\n    id\n    author {\n      id\n      username\n    }\n  }\n': typeof types.TweetAuthorFragmentFragmentDoc;
  '\n  fragment TweetsFragment on Query {\n    Tweets {\n      id\n      ...TweetFragment\n    }\n  }\n': typeof types.TweetsFragmentFragmentDoc;
  '\n  query TweetAppQuery {\n    ...TweetsFragment\n  }\n': typeof types.TweetAppQueryDocument;
};
const documents: Documents = {
  '\n  fragment TweetFragment on Tweet {\n    id\n    body\n    ...TweetAuthorFragment\n  }\n':
    types.TweetFragmentFragmentDoc,
  '\n  fragment TweetAuthorFragment on Tweet {\n    id\n    author {\n      id\n      username\n    }\n  }\n':
    types.TweetAuthorFragmentFragmentDoc,
  '\n  fragment TweetsFragment on Query {\n    Tweets {\n      id\n      ...TweetFragment\n    }\n  }\n':
    types.TweetsFragmentFragmentDoc,
  '\n  query TweetAppQuery {\n    ...TweetsFragment\n  }\n': types.TweetAppQueryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment TweetFragment on Tweet {\n    id\n    body\n    ...TweetAuthorFragment\n  }\n'
): (typeof documents)['\n  fragment TweetFragment on Tweet {\n    id\n    body\n    ...TweetAuthorFragment\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment TweetAuthorFragment on Tweet {\n    id\n    author {\n      id\n      username\n    }\n  }\n'
): (typeof documents)['\n  fragment TweetAuthorFragment on Tweet {\n    id\n    author {\n      id\n      username\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment TweetsFragment on Query {\n    Tweets {\n      id\n      ...TweetFragment\n    }\n  }\n'
): (typeof documents)['\n  fragment TweetsFragment on Query {\n    Tweets {\n      id\n      ...TweetFragment\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query TweetAppQuery {\n    ...TweetsFragment\n  }\n'
): (typeof documents)['\n  query TweetAppQuery {\n    ...TweetsFragment\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
  infer TType,
  any
>
  ? TType
  : never;
