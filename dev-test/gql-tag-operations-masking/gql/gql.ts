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
 */
const documents = {
  '\n  fragment TweetFragment on Tweet {\n    id\n    body\n    ...TweetAuthorFragment\n  }\n':
    types.TweetFragmentFragmentDoc,
  '\n  fragment TweetStatsFragment on Tweet {\n    id\n    Stats {\n      views\n    }\n  }\n':
    types.TweetStatsFragmentFragmentDoc,
  '\n  fragment TweetAuthorFragment on Tweet {\n    id\n    author {\n      id\n      username\n    }\n  }\n':
    types.TweetAuthorFragmentFragmentDoc,
  '\n  fragment TweetsFragment on Query {\n    Tweets {\n      id\n      ...TweetFragment\n      ...TweetStatsFragment\n    }\n  }\n':
    types.TweetsFragmentFragmentDoc,
  '\n  query TweetAppQuery {\n    ...TweetsFragment\n  }\n': types.TweetAppQueryDocument,
  '\n  fragment UserFragment on User {\n    id\n    username\n  }\n': types.UserFragmentFragmentDoc,
  '\n  fragment TweetWithUserFragment on Tweet {\n    id\n    body\n    author {\n      ...UserFragment\n    }\n  }\n':
    types.TweetWithUserFragmentFragmentDoc,
  '\n  fragment UserWithNameFragment on User {\n    id\n    username\n    first_name\n    last_name\n  }\n':
    types.UserWithNameFragmentFragmentDoc,
  '\n  fragment TweetWithUserNameFragment on Tweet {\n    id\n    body\n    author {\n      ...UserFragment\n      ...UserWithNameFragment\n    }\n  }\n':
    types.TweetWithUserNameFragmentFragmentDoc,
  '\n  fragment UserWithNestedFollowersAndTweetsFragment on User {\n    id\n    ...UserFragment\n    ...UserWithNameFragment\n    full_name\n    Followers {\n      id\n      ...UserFragment\n      Followers {\n        id\n        ...UserFragment\n      }\n      Tweets {\n        ...TweetWithUserFragment\n      }\n    }\n    Tweets {\n      id\n      ...TweetWithUserFragment\n      author {\n        id\n        Followers {\n          id\n          ...UserFragment\n        }\n      }\n    }\n  }\n':
    types.UserWithNestedFollowersAndTweetsFragmentFragmentDoc,
  '\n  fragment QueryOfNotificationsFragment on Query {\n    Notifications {\n      id\n\n      ... on Message {\n        body\n        from {\n          id\n        }\n      }\n      ... on Information {\n        body\n        priority\n      }\n    }\n  }\n':
    types.QueryOfNotificationsFragmentFragmentDoc,
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
  source: '\n  fragment TweetStatsFragment on Tweet {\n    id\n    Stats {\n      views\n    }\n  }\n'
): (typeof documents)['\n  fragment TweetStatsFragment on Tweet {\n    id\n    Stats {\n      views\n    }\n  }\n'];
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
  source: '\n  fragment TweetsFragment on Query {\n    Tweets {\n      id\n      ...TweetFragment\n      ...TweetStatsFragment\n    }\n  }\n'
): (typeof documents)['\n  fragment TweetsFragment on Query {\n    Tweets {\n      id\n      ...TweetFragment\n      ...TweetStatsFragment\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query TweetAppQuery {\n    ...TweetsFragment\n  }\n'
): (typeof documents)['\n  query TweetAppQuery {\n    ...TweetsFragment\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment UserFragment on User {\n    id\n    username\n  }\n'
): (typeof documents)['\n  fragment UserFragment on User {\n    id\n    username\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment TweetWithUserFragment on Tweet {\n    id\n    body\n    author {\n      ...UserFragment\n    }\n  }\n'
): (typeof documents)['\n  fragment TweetWithUserFragment on Tweet {\n    id\n    body\n    author {\n      ...UserFragment\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment UserWithNameFragment on User {\n    id\n    username\n    first_name\n    last_name\n  }\n'
): (typeof documents)['\n  fragment UserWithNameFragment on User {\n    id\n    username\n    first_name\n    last_name\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment TweetWithUserNameFragment on Tweet {\n    id\n    body\n    author {\n      ...UserFragment\n      ...UserWithNameFragment\n    }\n  }\n'
): (typeof documents)['\n  fragment TweetWithUserNameFragment on Tweet {\n    id\n    body\n    author {\n      ...UserFragment\n      ...UserWithNameFragment\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment UserWithNestedFollowersAndTweetsFragment on User {\n    id\n    ...UserFragment\n    ...UserWithNameFragment\n    full_name\n    Followers {\n      id\n      ...UserFragment\n      Followers {\n        id\n        ...UserFragment\n      }\n      Tweets {\n        ...TweetWithUserFragment\n      }\n    }\n    Tweets {\n      id\n      ...TweetWithUserFragment\n      author {\n        id\n        Followers {\n          id\n          ...UserFragment\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  fragment UserWithNestedFollowersAndTweetsFragment on User {\n    id\n    ...UserFragment\n    ...UserWithNameFragment\n    full_name\n    Followers {\n      id\n      ...UserFragment\n      Followers {\n        id\n        ...UserFragment\n      }\n      Tweets {\n        ...TweetWithUserFragment\n      }\n    }\n    Tweets {\n      id\n      ...TweetWithUserFragment\n      author {\n        id\n        Followers {\n          id\n          ...UserFragment\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment QueryOfNotificationsFragment on Query {\n    Notifications {\n      id\n\n      ... on Message {\n        body\n        from {\n          id\n        }\n      }\n      ... on Information {\n        body\n        priority\n      }\n    }\n  }\n'
): (typeof documents)['\n  fragment QueryOfNotificationsFragment on Query {\n    Notifications {\n      id\n\n      ... on Message {\n        body\n        from {\n          id\n        }\n      }\n      ... on Information {\n        body\n        priority\n      }\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
  infer TType,
  any
>
  ? TType
  : never;
