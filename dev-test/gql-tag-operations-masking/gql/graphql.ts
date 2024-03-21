/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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
  Date: { input: any; output: any };
  Url: { input: any; output: any };
};

export type Information = Notification & {
  __typename?: 'Information';
  body: Scalars['String']['output'];
  date?: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
  priority: Scalars['Int']['output'];
};

export type Message = Notification & {
  __typename?: 'Message';
  body: Scalars['String']['output'];
  date?: Maybe<Scalars['Date']['output']>;
  from: User;
  id: Scalars['ID']['output'];
  to: User;
};

export type Meta = {
  __typename?: 'Meta';
  count?: Maybe<Scalars['Int']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createTweet?: Maybe<Tweet>;
  deleteTweet?: Maybe<Tweet>;
  markTweetRead?: Maybe<Scalars['Boolean']['output']>;
};

export type MutationCreateTweetArgs = {
  body?: InputMaybe<Scalars['String']['input']>;
};

export type MutationDeleteTweetArgs = {
  id: Scalars['ID']['input'];
};

export type MutationMarkTweetReadArgs = {
  id: Scalars['ID']['input'];
};

export type Notification = {
  date?: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
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
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryTweetArgs = {
  id: Scalars['ID']['input'];
};

export type QueryTweetsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sort_field?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['String']['input']>;
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type Stat = {
  __typename?: 'Stat';
  likes?: Maybe<Scalars['Int']['output']>;
  responses?: Maybe<Scalars['Int']['output']>;
  retweets?: Maybe<Scalars['Int']['output']>;
  views?: Maybe<Scalars['Int']['output']>;
};

export type Tweet = {
  __typename?: 'Tweet';
  Stats?: Maybe<Stat>;
  author: User;
  body: Scalars['String']['output'];
  date?: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
};

export type User = {
  __typename?: 'User';
  Followers: Array<User>;
  Tweets: Array<Tweet>;
  avatar_url?: Maybe<Scalars['Url']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  full_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
  /** @deprecated Field no longer supported */
  name?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type TweetFragmentFragment = ({ __typename?: 'Tweet'; id: string; body: string } & {
  ' $fragmentRefs'?: { TweetAuthorFragmentFragment: TweetAuthorFragmentFragment };
}) & { ' $fragmentName'?: 'TweetFragmentFragment' };

export type TweetStatsFragmentFragment = {
  __typename?: 'Tweet';
  id: string;
  Stats?: { __typename?: 'Stat'; views?: number | null } | null;
} & { ' $fragmentName'?: 'TweetStatsFragmentFragment' };

export type TweetAuthorFragmentFragment = {
  __typename?: 'Tweet';
  id: string;
  author: { __typename?: 'User'; id: string; username?: string | null };
} & { ' $fragmentName'?: 'TweetAuthorFragmentFragment' };

export type TweetsFragmentFragment = {
  __typename?: 'Query';
  Tweets?: Array<
    { __typename?: 'Tweet'; id: string } & {
      ' $fragmentRefs'?: {
        TweetFragmentFragment: TweetFragmentFragment;
        TweetStatsFragmentFragment: TweetStatsFragmentFragment;
      };
    }
  > | null;
} & { ' $fragmentName'?: 'TweetsFragmentFragment' };

export type TweetAppQueryQueryVariables = Exact<{ [key: string]: never }>;

export type TweetAppQueryQuery = { __typename?: 'Query' } & {
  ' $fragmentRefs'?: { TweetsFragmentFragment: TweetsFragmentFragment };
};

export type UserFragmentFragment = { __typename?: 'User'; id: string; username?: string | null } & {
  ' $fragmentName'?: 'UserFragmentFragment';
};

export type TweetWithUserFragmentFragment = {
  __typename?: 'Tweet';
  id: string;
  body: string;
  author: { __typename?: 'User' } & { ' $fragmentRefs'?: { UserFragmentFragment: UserFragmentFragment } };
} & { ' $fragmentName'?: 'TweetWithUserFragmentFragment' };

export type UserWithNameFragmentFragment = {
  __typename?: 'User';
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
} & { ' $fragmentName'?: 'UserWithNameFragmentFragment' };

export type TweetWithUserNameFragmentFragment = {
  __typename?: 'Tweet';
  id: string;
  body: string;
  author: { __typename?: 'User' } & {
    ' $fragmentRefs'?: {
      UserFragmentFragment: UserFragmentFragment;
      UserWithNameFragmentFragment: UserWithNameFragmentFragment;
    };
  };
} & { ' $fragmentName'?: 'TweetWithUserNameFragmentFragment' };

export type UserWithNestedFollowersAndTweetsFragmentFragment = ({
  __typename?: 'User';
  id: string;
  full_name?: string | null;
  Followers: Array<
    {
      __typename?: 'User';
      id: string;
      Followers: Array<
        { __typename?: 'User'; id: string } & { ' $fragmentRefs'?: { UserFragmentFragment: UserFragmentFragment } }
      >;
      Tweets: Array<
        { __typename?: 'Tweet' } & {
          ' $fragmentRefs'?: { TweetWithUserFragmentFragment: TweetWithUserFragmentFragment };
        }
      >;
    } & { ' $fragmentRefs'?: { UserFragmentFragment: UserFragmentFragment } }
  >;
  Tweets: Array<
    {
      __typename?: 'Tweet';
      id: string;
      author: {
        __typename?: 'User';
        id: string;
        Followers: Array<
          { __typename?: 'User'; id: string } & { ' $fragmentRefs'?: { UserFragmentFragment: UserFragmentFragment } }
        >;
      };
    } & { ' $fragmentRefs'?: { TweetWithUserFragmentFragment: TweetWithUserFragmentFragment } }
  >;
} & {
  ' $fragmentRefs'?: {
    UserFragmentFragment: UserFragmentFragment;
    UserWithNameFragmentFragment: UserWithNameFragmentFragment;
  };
}) & { ' $fragmentName'?: 'UserWithNestedFollowersAndTweetsFragmentFragment' };

export type QueryOfNotificationsFragmentFragment = {
  __typename?: 'Query';
  Notifications?: Array<
    | { __typename?: 'Information'; body: string; priority: number; id: string }
    | { __typename?: 'Message'; body: string; id: string; from: { __typename?: 'User'; id: string } }
    | null
  > | null;
} & { ' $fragmentName'?: 'QueryOfNotificationsFragmentFragment' };

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
export const TweetStatsFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetStatsFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'Stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'views' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TweetStatsFragmentFragment, unknown>;
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
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'TweetStatsFragment' } },
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
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetStatsFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'Stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'views' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TweetsFragmentFragment, unknown>;
export const UserFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserFragmentFragment, unknown>;
export const UserWithNameFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserWithNameFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'first_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'last_name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserWithNameFragmentFragment, unknown>;
export const TweetWithUserNameFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetWithUserNameFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'author' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFragment' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserWithNameFragment' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserWithNameFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'first_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'last_name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TweetWithUserNameFragmentFragment, unknown>;
export const TweetWithUserFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetWithUserFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'author' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFragment' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TweetWithUserFragmentFragment, unknown>;
export const UserWithNestedFollowersAndTweetsFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserWithNestedFollowersAndTweetsFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFragment' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserWithNameFragment' } },
          { kind: 'Field', name: { kind: 'Name', value: 'full_name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'Followers' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFragment' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'Followers' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFragment' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'Tweets' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TweetWithUserFragment' } }],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'Tweets' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'TweetWithUserFragment' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'author' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'Followers' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFragment' } },
                          ],
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
      name: { kind: 'Name', value: 'UserFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserWithNameFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'first_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'last_name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TweetWithUserFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'author' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFragment' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserWithNestedFollowersAndTweetsFragmentFragment, unknown>;
export const QueryOfNotificationsFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'QueryOfNotificationsFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Query' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'Notifications' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'InlineFragment',
                  typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Message' } },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'from' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'InlineFragment',
                  typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Information' } },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<QueryOfNotificationsFragmentFragment, unknown>;
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
      name: { kind: 'Name', value: 'TweetStatsFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Tweet' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'Stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'views' } }],
            },
          },
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
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'TweetStatsFragment' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TweetAppQueryQuery, TweetAppQueryQueryVariables>;
