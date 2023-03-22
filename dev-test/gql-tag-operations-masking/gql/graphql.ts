/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = { [P in keyof T]: T[P] } | { [P in keyof T]?: never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  Url: any;
};

export type Meta = {
  __typename?: 'Meta';
  count?: Maybe<Scalars['Int']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createTweet?: Maybe<Tweet>;
  deleteTweet?: Maybe<Tweet>;
  markTweetRead?: Maybe<Scalars['Boolean']>;
};

export type MutationCreateTweetArgs = {
  body?: InputMaybe<Scalars['String']>;
};

export type MutationDeleteTweetArgs = {
  id: Scalars['ID'];
};

export type MutationMarkTweetReadArgs = {
  id: Scalars['ID'];
};

export type Notification = {
  __typename?: 'Notification';
  date?: Maybe<Scalars['Date']>;
  id?: Maybe<Scalars['ID']>;
  type?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  Notifications?: Maybe<Array<Maybe<Notification>>>;
  NotificationsMeta?: Maybe<Meta>;
  Tweet?: Maybe<Tweet>;
  Tweets?: Maybe<Array<Tweet>>;
  TweetsMeta?: Maybe<Meta>;
  User?: Maybe<User>;
};

export type QueryNotificationsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
};

export type QueryTweetArgs = {
  id: Scalars['ID'];
};

export type QueryTweetsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  sort_field?: InputMaybe<Scalars['String']>;
  sort_order?: InputMaybe<Scalars['String']>;
};

export type QueryUserArgs = {
  id: Scalars['ID'];
};

export type Stat = {
  __typename?: 'Stat';
  likes?: Maybe<Scalars['Int']>;
  responses?: Maybe<Scalars['Int']>;
  retweets?: Maybe<Scalars['Int']>;
  views?: Maybe<Scalars['Int']>;
};

export type Tweet = {
  __typename?: 'Tweet';
  Stats?: Maybe<Stat>;
  author: User;
  body: Scalars['String'];
  date?: Maybe<Scalars['Date']>;
  id: Scalars['ID'];
};

export type User = {
  __typename?: 'User';
  avatar_url?: Maybe<Scalars['Url']>;
  first_name?: Maybe<Scalars['String']>;
  full_name?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  last_name?: Maybe<Scalars['String']>;
  /** @deprecated Field no longer supported */
  name?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
};

export type TweetFragmentFragment = ({ __typename?: 'Tweet'; id: string; body: string } & {
  ' $fragmentRefs'?: { TweetAuthorFragmentFragment: TweetAuthorFragmentFragment };
}) & { ' $fragmentName'?: 'TweetFragmentFragment' };

export type TweetAuthorFragmentFragment = {
  __typename?: 'Tweet';
  id: string;
  author: { __typename?: 'User'; id: string; username?: string | null };
} & { ' $fragmentName'?: 'TweetAuthorFragmentFragment' };

export type TweetsFragmentFragment = {
  __typename?: 'Query';
  Tweets?: Array<
    { __typename?: 'Tweet'; id: string } & { ' $fragmentRefs'?: { TweetFragmentFragment: TweetFragmentFragment } }
  > | null;
} & { ' $fragmentName'?: 'TweetsFragmentFragment' };

export type TweetAppQueryQueryVariables = Exact<{ [key: string]: never }>;

export type TweetAppQueryQuery = { __typename?: 'Query' } & {
  ' $fragmentRefs'?: { TweetsFragmentFragment: TweetsFragmentFragment };
};

export const TweetAuthorFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetAuthorFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'author' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TweetAuthorFragmentFragment, unknown>;
export const TweetFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'TweetAuthorFragment' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetAuthorFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'author' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TweetFragmentFragment, unknown>;
export const TweetsFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetsFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Query' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'Tweets' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'TweetFragment' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetAuthorFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'author' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'TweetAuthorFragment' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TweetsFragmentFragment, unknown>;
export const TweetAppQueryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'TweetAppQuery' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TweetsFragment' } }],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetAuthorFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'author' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'TweetAuthorFragment' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetsFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Query' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'Tweets' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'TweetFragment' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TweetAppQueryQuery, TweetAppQueryQueryVariables>;
