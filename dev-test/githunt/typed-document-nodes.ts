import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

/** A comment about an entry, submitted by a user */
export type Comment = {
  __typename?: 'Comment';
  /** The text of the comment */
  content: Scalars['String'];
  /** A timestamp of when the comment was posted */
  createdAt: Scalars['Float'];
  /** The SQL ID of this entry */
  id: Scalars['Int'];
  /** The GitHub user who posted the comment */
  postedBy: User;
  /** The repository which this comment is about */
  repoName: Scalars['String'];
};

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {
  __typename?: 'Entry';
  /** The number of comments posted about this repository */
  commentCount: Scalars['Int'];
  /** Comments posted about this repository */
  comments: Array<Maybe<Comment>>;
  /** A timestamp of when the entry was submitted */
  createdAt: Scalars['Float'];
  /** The hot score of this repository */
  hotScore: Scalars['Float'];
  /** The SQL ID of this entry */
  id: Scalars['Int'];
  /** The GitHub user who submitted this entry */
  postedBy: User;
  /** Information about the repository from GitHub */
  repository: Repository;
  /** The score of this repository, upvotes - downvotes */
  score: Scalars['Int'];
  /** XXX to be changed */
  vote: Vote;
};

/** Information about a GitHub repository submitted to GitHunt */
export type EntryCommentsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

/** A list of options for the sort order of the feed */
export enum FeedType {
  /** Sort by a combination of freshness and score, using Reddit's algorithm */
  Hot = 'HOT',
  /** Newest entries first */
  New = 'NEW',
  /** Highest score entries first */
  Top = 'TOP',
}

export type Mutation = {
  __typename?: 'Mutation';
  /** Comment on a repository, returns the new comment */
  submitComment?: Maybe<Comment>;
  /** Submit a new repository, returns the new submission */
  submitRepository?: Maybe<Entry>;
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: Maybe<Entry>;
};

export type MutationSubmitCommentArgs = {
  commentContent: Scalars['String'];
  repoFullName: Scalars['String'];
};

export type MutationSubmitRepositoryArgs = {
  repoFullName: Scalars['String'];
};

export type MutationVoteArgs = {
  repoFullName: Scalars['String'];
  type: VoteType;
};

export type Query = {
  __typename?: 'Query';
  /** Return the currently logged in user, or null if nobody is logged in */
  currentUser?: Maybe<User>;
  /** A single entry */
  entry?: Maybe<Entry>;
  /** A feed of repository submissions */
  feed?: Maybe<Array<Maybe<Entry>>>;
};

export type QueryEntryArgs = {
  repoFullName: Scalars['String'];
};

export type QueryFeedArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  type: FeedType;
};

/**
 * A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 */
export type Repository = {
  __typename?: 'Repository';
  /** The description of the repository */
  description?: Maybe<Scalars['String']>;
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: Scalars['String'];
  /** The link to the repository on GitHub */
  html_url: Scalars['String'];
  /** Just the name of the repository, e.g. GitHunt-API */
  name: Scalars['String'];
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: Maybe<Scalars['Int']>;
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: Maybe<User>;
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: Scalars['Int'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscription fires on every comment added */
  commentAdded?: Maybe<Comment>;
};

export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String'];
};

/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export type User = {
  __typename?: 'User';
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: Scalars['String'];
  /** The URL of this user's GitHub page */
  html_url: Scalars['String'];
  /** The name of the user, e.g. apollostack */
  login: Scalars['String'];
};

/** XXX to be removed */
export type Vote = {
  __typename?: 'Vote';
  vote_value: Scalars['Int'];
};

/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Cancel = 'CANCEL',
  Down = 'DOWN',
  Up = 'UP',
}

export type OnCommentAddedSubscriptionVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type OnCommentAddedSubscription = {
  __typename?: 'Subscription';
  commentAdded?:
    | {
        __typename?: 'Comment';
        id: number;
        createdAt: number;
        content: string;
        postedBy: { __typename?: 'User'; login: string; html_url: string };
      }
    | null
    | undefined;
};

export type CommentQueryVariables = Exact<{
  repoFullName: Scalars['String'];
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}>;

export type CommentQuery = {
  __typename?: 'Query';
  currentUser?: { __typename?: 'User'; login: string; html_url: string } | null | undefined;
  entry?:
    | {
        __typename?: 'Entry';
        id: number;
        createdAt: number;
        commentCount: number;
        postedBy: { __typename?: 'User'; login: string; html_url: string };
        comments: Array<
          | {
              __typename?: 'Comment';
              id: number;
              createdAt: number;
              content: string;
              postedBy: { __typename?: 'User'; login: string; html_url: string };
            }
          | null
          | undefined
        >;
        repository: {
          __typename?: 'Repository';
          description?: string | null | undefined;
          open_issues_count?: number | null | undefined;
          stargazers_count: number;
          full_name: string;
          html_url: string;
        };
      }
    | null
    | undefined;
};

export type CommentsPageCommentFragment = {
  __typename?: 'Comment';
  id: number;
  createdAt: number;
  content: string;
  postedBy: { __typename?: 'User'; login: string; html_url: string };
};

export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserForProfileQuery = {
  __typename?: 'Query';
  currentUser?: { __typename?: 'User'; login: string; avatar_url: string } | null | undefined;
};

export type FeedEntryFragment = {
  __typename?: 'Entry';
  id: number;
  commentCount: number;
  score: number;
  createdAt: number;
  repository: {
    __typename?: 'Repository';
    full_name: string;
    html_url: string;
    description?: string | null | undefined;
    stargazers_count: number;
    open_issues_count?: number | null | undefined;
    owner?: { __typename?: 'User'; avatar_url: string } | null | undefined;
  };
  vote: { __typename?: 'Vote'; vote_value: number };
  postedBy: { __typename?: 'User'; html_url: string; login: string };
};

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;

export type FeedQuery = {
  __typename?: 'Query';
  currentUser?: { __typename?: 'User'; login: string } | null | undefined;
  feed?:
    | Array<
        | {
            __typename?: 'Entry';
            id: number;
            commentCount: number;
            score: number;
            createdAt: number;
            repository: {
              __typename?: 'Repository';
              full_name: string;
              html_url: string;
              description?: string | null | undefined;
              stargazers_count: number;
              open_issues_count?: number | null | undefined;
              owner?: { __typename?: 'User'; avatar_url: string } | null | undefined;
            };
            vote: { __typename?: 'Vote'; vote_value: number };
            postedBy: { __typename?: 'User'; html_url: string; login: string };
          }
        | null
        | undefined
      >
    | null
    | undefined;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type SubmitRepositoryMutation = {
  __typename?: 'Mutation';
  submitRepository?: { __typename?: 'Entry'; createdAt: number } | null | undefined;
};

export type RepoInfoFragment = {
  __typename?: 'Entry';
  createdAt: number;
  repository: {
    __typename?: 'Repository';
    description?: string | null | undefined;
    stargazers_count: number;
    open_issues_count?: number | null | undefined;
  };
  postedBy: { __typename?: 'User'; html_url: string; login: string };
};

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
}>;

export type SubmitCommentMutation = {
  __typename?: 'Mutation';
  submitComment?:
    | {
        __typename?: 'Comment';
        id: number;
        createdAt: number;
        content: string;
        postedBy: { __typename?: 'User'; login: string; html_url: string };
      }
    | null
    | undefined;
};

export type VoteButtonsFragment = {
  __typename?: 'Entry';
  score: number;
  vote: { __typename?: 'Vote'; vote_value: number };
};

export type VoteMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  type: VoteType;
}>;

export type VoteMutation = {
  __typename?: 'Mutation';
  vote?:
    | { __typename?: 'Entry'; score: number; id: number; vote: { __typename?: 'Vote'; vote_value: number } }
    | null
    | undefined;
};

export const CommentsPageCommentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CommentsPageComment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Comment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'postedBy' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'content' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CommentsPageCommentFragment, unknown>;
export const VoteButtonsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'VoteButtons' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'score' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'vote' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'vote_value' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VoteButtonsFragment, unknown>;
export const RepoInfoFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RepoInfo' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'repository' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stargazers_count' } },
                { kind: 'Field', name: { kind: 'Name', value: 'open_issues_count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'postedBy' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RepoInfoFragment, unknown>;
export const FeedEntryFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FeedEntry' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commentCount' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'repository' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'full_name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'avatar_url' } }],
                  },
                },
              ],
            },
          },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'VoteButtons' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'RepoInfo' } },
        ],
      },
    },
    ...VoteButtonsFragmentDoc.definitions,
    ...RepoInfoFragmentDoc.definitions,
  ],
} as unknown as DocumentNode<FeedEntryFragment, unknown>;
export const OnCommentAddedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'onCommentAdded' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'commentAdded' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'repoFullName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'postedBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>;
export const CommentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Comment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'entry' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'repoFullName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'postedBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'comments' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'limit' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'offset' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'CommentsPageComment' } }],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'commentCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'repository' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'full_name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                      {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Repository' } },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'open_issues_count' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'stargazers_count' } },
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
    ...CommentsPageCommentFragmentDoc.definitions,
  ],
} as unknown as DocumentNode<CommentQuery, CommentQueryVariables>;
export const CurrentUserForProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CurrentUserForProfile' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avatar_url' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>;
export const FeedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Feed' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'type' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'FeedType' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'login' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'feed' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'type' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'type' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'offset' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'FeedEntry' } }],
            },
          },
        ],
      },
    },
    ...FeedEntryFragmentDoc.definitions,
  ],
} as unknown as DocumentNode<FeedQuery, FeedQueryVariables>;
export const SubmitRepositoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'submitRepository' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'submitRepository' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'repoFullName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'createdAt' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>;
export const SubmitCommentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'submitComment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commentContent' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'submitComment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'repoFullName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'commentContent' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commentContent' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'CommentsPageComment' } }],
            },
          },
        ],
      },
    },
    ...CommentsPageCommentFragmentDoc.definitions,
  ],
} as unknown as DocumentNode<SubmitCommentMutation, SubmitCommentMutationVariables>;
export const VoteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'vote' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'type' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'VoteType' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'vote' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'repoFullName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'type' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'type' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'vote' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'vote_value' } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VoteMutation, VoteMutationVariables>;
