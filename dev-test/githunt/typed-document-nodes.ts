import { DocumentNode } from 'graphql';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  /** A feed of repository submissions */
  feed?: Maybe<Array<Maybe<Entry>>>;
  /** A single entry */
  entry?: Maybe<Entry>;
  /** Return the currently logged in user, or null if nobody is logged in */
  currentUser?: Maybe<User>;
};

export type QueryFeedArgs = {
  type: FeedType;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};

export type QueryEntryArgs = {
  repoFullName: Scalars['String'];
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

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {
  __typename?: 'Entry';
  /** Information about the repository from GitHub */
  repository: Repository;
  /** The GitHub user who submitted this entry */
  postedBy: User;
  /** A timestamp of when the entry was submitted */
  createdAt: Scalars['Float'];
  /** The score of this repository, upvotes - downvotes */
  score: Scalars['Int'];
  /** The hot score of this repository */
  hotScore: Scalars['Float'];
  /** Comments posted about this repository */
  comments: Array<Maybe<Comment>>;
  /** The number of comments posted about this repository */
  commentCount: Scalars['Int'];
  /** The SQL ID of this entry */
  id: Scalars['Int'];
  /** XXX to be changed */
  vote: Vote;
};

/** Information about a GitHub repository submitted to GitHunt */
export type EntryCommentsArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

/**
 * A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 */
export type Repository = {
  __typename?: 'Repository';
  /** Just the name of the repository, e.g. GitHunt-API */
  name: Scalars['String'];
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: Scalars['String'];
  /** The description of the repository */
  description?: Maybe<Scalars['String']>;
  /** The link to the repository on GitHub */
  html_url: Scalars['String'];
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: Scalars['Int'];
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: Maybe<Scalars['Int']>;
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: Maybe<User>;
};

/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export type User = {
  __typename?: 'User';
  /** The name of the user, e.g. apollostack */
  login: Scalars['String'];
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: Scalars['String'];
  /** The URL of this user's GitHub page */
  html_url: Scalars['String'];
};

/** A comment about an entry, submitted by a user */
export type Comment = {
  __typename?: 'Comment';
  /** The SQL ID of this entry */
  id: Scalars['Int'];
  /** The GitHub user who posted the comment */
  postedBy: User;
  /** A timestamp of when the comment was posted */
  createdAt: Scalars['Float'];
  /** The text of the comment */
  content: Scalars['String'];
  /** The repository which this comment is about */
  repoName: Scalars['String'];
};

/** XXX to be removed */
export type Vote = {
  __typename?: 'Vote';
  vote_value: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Submit a new repository, returns the new submission */
  submitRepository?: Maybe<Entry>;
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: Maybe<Entry>;
  /** Comment on a repository, returns the new comment */
  submitComment?: Maybe<Comment>;
};

export type MutationSubmitRepositoryArgs = {
  repoFullName: Scalars['String'];
};

export type MutationVoteArgs = {
  repoFullName: Scalars['String'];
  type: VoteType;
};

export type MutationSubmitCommentArgs = {
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
};

/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL',
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscription fires on every comment added */
  commentAdded?: Maybe<Comment>;
};

export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String'];
};

export type OnCommentAddedSubscriptionVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type OnCommentAddedSubscription = { __typename?: 'Subscription' } & {
  commentAdded?: Maybe<
    { __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & {
        postedBy: { __typename?: 'User' } & Pick<User, 'login' | 'html_url'>;
      }
  >;
};

export type CommentQueryVariables = Exact<{
  repoFullName: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;

export type CommentQuery = { __typename?: 'Query' } & {
  currentUser?: Maybe<{ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>>;
  entry?: Maybe<
    { __typename?: 'Entry' } & Pick<Entry, 'id' | 'createdAt' | 'commentCount'> & {
        postedBy: { __typename?: 'User' } & Pick<User, 'login' | 'html_url'>;
        comments: Array<Maybe<{ __typename?: 'Comment' } & CommentsPageCommentFragment>>;
        repository: { __typename?: 'Repository' } & Pick<
          Repository,
          'description' | 'open_issues_count' | 'stargazers_count' | 'full_name' | 'html_url'
        >;
      }
  >;
};

export type CommentsPageCommentFragment = { __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & {
    postedBy: { __typename?: 'User' } & Pick<User, 'login' | 'html_url'>;
  };

export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserForProfileQuery = { __typename?: 'Query' } & {
  currentUser?: Maybe<{ __typename?: 'User' } & Pick<User, 'login' | 'avatar_url'>>;
};

export type FeedEntryFragment = { __typename?: 'Entry' } & Pick<Entry, 'id' | 'commentCount'> & {
    repository: { __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & {
        owner?: Maybe<{ __typename?: 'User' } & Pick<User, 'avatar_url'>>;
      };
  } & VoteButtonsFragment &
  RepoInfoFragment;

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
}>;

export type FeedQuery = { __typename?: 'Query' } & {
  currentUser?: Maybe<{ __typename?: 'User' } & Pick<User, 'login'>>;
  feed?: Maybe<Array<Maybe<{ __typename?: 'Entry' } & FeedEntryFragment>>>;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type SubmitRepositoryMutation = { __typename?: 'Mutation' } & {
  submitRepository?: Maybe<{ __typename?: 'Entry' } & Pick<Entry, 'createdAt'>>;
};

export type RepoInfoFragment = { __typename?: 'Entry' } & Pick<Entry, 'createdAt'> & {
    repository: { __typename?: 'Repository' } & Pick<
      Repository,
      'description' | 'stargazers_count' | 'open_issues_count'
    >;
    postedBy: { __typename?: 'User' } & Pick<User, 'html_url' | 'login'>;
  };

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
}>;

export type SubmitCommentMutation = { __typename?: 'Mutation' } & {
  submitComment?: Maybe<{ __typename?: 'Comment' } & CommentsPageCommentFragment>;
};

export type VoteButtonsFragment = { __typename?: 'Entry' } & Pick<Entry, 'score'> & {
    vote: { __typename?: 'Vote' } & Pick<Vote, 'vote_value'>;
  };

export type VoteMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  type: VoteType;
}>;

export type VoteMutation = { __typename?: 'Mutation' } & {
  vote?: Maybe<
    { __typename?: 'Entry' } & Pick<Entry, 'score' | 'id'> & {
        vote: { __typename?: 'Vote' } & Pick<Vote, 'vote_value'>;
      }
  >;
};

export const CommentsPageCommentFragmentDoc: DocumentNode = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CommentsPageComment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Comment' } },
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' }, arguments: [], directives: [] },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'postedBy' },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'login' }, arguments: [], directives: [] },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' }, arguments: [], directives: [] },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' }, arguments: [], directives: [] },
          { kind: 'Field', name: { kind: 'Name', value: 'content' }, arguments: [], directives: [] },
        ],
      },
    },
  ],
};
export const VoteButtonsFragmentDoc: DocumentNode = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'VoteButtons' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'score' }, arguments: [], directives: [] },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'vote' },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'vote_value' }, arguments: [], directives: [] },
              ],
            },
          },
        ],
      },
    },
  ],
};
export const RepoInfoFragmentDoc: DocumentNode = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RepoInfo' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' }, arguments: [], directives: [] },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'repository' },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'description' }, arguments: [], directives: [] },
                { kind: 'Field', name: { kind: 'Name', value: 'stargazers_count' }, arguments: [], directives: [] },
                { kind: 'Field', name: { kind: 'Name', value: 'open_issues_count' }, arguments: [], directives: [] },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'postedBy' },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' }, arguments: [], directives: [] },
                { kind: 'Field', name: { kind: 'Name', value: 'login' }, arguments: [], directives: [] },
              ],
            },
          },
        ],
      },
    },
  ],
};
export const FeedEntryFragmentDoc: DocumentNode = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FeedEntry' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' }, arguments: [], directives: [] },
          { kind: 'Field', name: { kind: 'Name', value: 'commentCount' }, arguments: [], directives: [] },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'repository' },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'full_name' }, arguments: [], directives: [] },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' }, arguments: [], directives: [] },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'avatar_url' }, arguments: [], directives: [] },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'VoteButtons' }, directives: [] },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'RepoInfo' }, directives: [] },
        ],
      },
    },
    ...VoteButtonsFragmentDoc.definitions,
    ...RepoInfoFragmentDoc.definitions,
  ],
};
export const OnCommentAddedDocument: TypedDocumentNode<
  OnCommentAddedSubscription,
  OnCommentAddedSubscriptionVariables
> = {
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
          directives: [],
        },
      ],
      directives: [],
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
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' }, arguments: [], directives: [] },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'postedBy' },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'login' }, arguments: [], directives: [] },
                      { kind: 'Field', name: { kind: 'Name', value: 'html_url' }, arguments: [], directives: [] },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' }, arguments: [], directives: [] },
                { kind: 'Field', name: { kind: 'Name', value: 'content' }, arguments: [], directives: [] },
              ],
            },
          },
        ],
      },
    },
  ],
};
export const CommentDocument: TypedDocumentNode<CommentQuery, CommentQueryVariables> = {
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
          directives: [],
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          directives: [],
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          directives: [],
        },
      ],
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'login' }, arguments: [], directives: [] },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' }, arguments: [], directives: [] },
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
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' }, arguments: [], directives: [] },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'postedBy' },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'login' }, arguments: [], directives: [] },
                      { kind: 'Field', name: { kind: 'Name', value: 'html_url' }, arguments: [], directives: [] },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' }, arguments: [], directives: [] },
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
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CommentsPageComment' }, directives: [] },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'commentCount' }, arguments: [], directives: [] },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'repository' },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'full_name' }, arguments: [], directives: [] },
                      { kind: 'Field', name: { kind: 'Name', value: 'html_url' }, arguments: [], directives: [] },
                      {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Repository' } },
                        directives: [],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                              arguments: [],
                              directives: [],
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'open_issues_count' },
                              arguments: [],
                              directives: [],
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'stargazers_count' },
                              arguments: [],
                              directives: [],
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
        ],
      },
    },
    ...CommentsPageCommentFragmentDoc.definitions,
  ],
};
export const CurrentUserForProfileDocument: TypedDocumentNode<
  CurrentUserForProfileQuery,
  CurrentUserForProfileQueryVariables
> = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CurrentUserForProfile' },
      variableDefinitions: [],
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'login' }, arguments: [], directives: [] },
                { kind: 'Field', name: { kind: 'Name', value: 'avatar_url' }, arguments: [], directives: [] },
              ],
            },
          },
        ],
      },
    },
  ],
};
export const FeedDocument: TypedDocumentNode<FeedQuery, FeedQueryVariables> = {
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
          directives: [],
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          directives: [],
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          directives: [],
        },
      ],
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'login' }, arguments: [], directives: [] }],
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
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'FeedEntry' }, directives: [] }],
            },
          },
        ],
      },
    },
    ...FeedEntryFragmentDoc.definitions,
  ],
};
export const SubmitRepositoryDocument: TypedDocumentNode<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables
> = {
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
          directives: [],
        },
      ],
      directives: [],
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
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' }, arguments: [], directives: [] },
              ],
            },
          },
        ],
      },
    },
  ],
};
export const SubmitCommentDocument: TypedDocumentNode<SubmitCommentMutation, SubmitCommentMutationVariables> = {
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
          directives: [],
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commentContent' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
          directives: [],
        },
      ],
      directives: [],
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
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CommentsPageComment' }, directives: [] },
              ],
            },
          },
        ],
      },
    },
    ...CommentsPageCommentFragmentDoc.definitions,
  ],
};
export const VoteDocument: TypedDocumentNode<VoteMutation, VoteMutationVariables> = {
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
          directives: [],
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'type' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'VoteType' } } },
          directives: [],
        },
      ],
      directives: [],
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
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'score' }, arguments: [], directives: [] },
                { kind: 'Field', name: { kind: 'Name', value: 'id' }, arguments: [], directives: [] },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'vote' },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'vote_value' }, arguments: [], directives: [] },
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
};
