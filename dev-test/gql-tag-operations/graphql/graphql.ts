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
  Tweets?: Maybe<Array<Maybe<Tweet>>>;
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
  Author?: Maybe<User>;
  Stats?: Maybe<Stat>;
  body?: Maybe<Scalars['String']>;
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

export type FooQueryVariables = Exact<{ [key: string]: never }>;

export type FooQuery = { __typename?: 'Query'; Tweets?: Array<{ __typename?: 'Tweet'; id: string } | null> | null };

export type LelFragment = { __typename?: 'Tweet'; id: string; body?: string | null } & {
  ' $fragmentName'?: 'LelFragment';
};

export type BarQueryVariables = Exact<{ [key: string]: never }>;

export type BarQuery = {
  __typename?: 'Query';
  Tweets?: Array<({ __typename?: 'Tweet' } & { ' $fragmentRefs'?: { LelFragment: LelFragment } }) | null> | null;
};

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
