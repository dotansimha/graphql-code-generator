import {
  Resolver as GraphCacheResolver,
  UpdateResolver as GraphCacheUpdateResolver,
  OptimisticMutationResolver as GraphCacheOptimisticMutationResolver,
  StorageAdapter as GraphCacheStorageAdapter,
} from '@urql/exchange-graphcache';
import { IntrospectionData } from '@urql/exchange-graphcache/dist/types/ast';
import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
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
  commentAdded?: {
    __typename?: 'Comment';
    id: number;
    createdAt: number;
    content: string;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
  } | null;
};

export type CommentQueryVariables = Exact<{
  repoFullName: Scalars['String'];
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}>;

export type CommentQuery = {
  __typename?: 'Query';
  currentUser?: { __typename?: 'User'; login: string; html_url: string } | null;
  entry?: {
    __typename?: 'Entry';
    id: number;
    createdAt: number;
    commentCount: number;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
    comments: Array<{
      __typename?: 'Comment';
      id: number;
      createdAt: number;
      content: string;
      postedBy: { __typename?: 'User'; login: string; html_url: string };
    } | null>;
    repository: {
      __typename?: 'Repository';
      description?: string | null;
      open_issues_count?: number | null;
      stargazers_count: number;
      full_name: string;
      html_url: string;
    };
  } | null;
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
  currentUser?: { __typename?: 'User'; login: string; avatar_url: string } | null;
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
    description?: string | null;
    stargazers_count: number;
    open_issues_count?: number | null;
    owner?: { __typename?: 'User'; avatar_url: string } | null;
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
  currentUser?: { __typename?: 'User'; login: string } | null;
  feed?: Array<{
    __typename?: 'Entry';
    id: number;
    commentCount: number;
    score: number;
    createdAt: number;
    repository: {
      __typename?: 'Repository';
      full_name: string;
      html_url: string;
      description?: string | null;
      stargazers_count: number;
      open_issues_count?: number | null;
      owner?: { __typename?: 'User'; avatar_url: string } | null;
    };
    vote: { __typename?: 'Vote'; vote_value: number };
    postedBy: { __typename?: 'User'; html_url: string; login: string };
  } | null> | null;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type SubmitRepositoryMutation = {
  __typename?: 'Mutation';
  submitRepository?: { __typename?: 'Entry'; createdAt: number } | null;
};

export type RepoInfoFragment = {
  __typename?: 'Entry';
  createdAt: number;
  repository: {
    __typename?: 'Repository';
    description?: string | null;
    stargazers_count: number;
    open_issues_count?: number | null;
  };
  postedBy: { __typename?: 'User'; html_url: string; login: string };
};

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
}>;

export type SubmitCommentMutation = {
  __typename?: 'Mutation';
  submitComment?: {
    __typename?: 'Comment';
    id: number;
    createdAt: number;
    content: string;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
  } | null;
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
  vote?: { __typename?: 'Entry'; score: number; id: number; vote: { __typename?: 'Vote'; vote_value: number } } | null;
};

export const CommentsPageCommentFragmentDoc = gql`
  fragment CommentsPageComment on Comment {
    id
    postedBy {
      login
      html_url
    }
    createdAt
    content
  }
`;
export const VoteButtonsFragmentDoc = gql`
  fragment VoteButtons on Entry {
    score
    vote {
      vote_value
    }
  }
`;
export const RepoInfoFragmentDoc = gql`
  fragment RepoInfo on Entry {
    createdAt
    repository {
      description
      stargazers_count
      open_issues_count
    }
    postedBy {
      html_url
      login
    }
  }
`;
export const FeedEntryFragmentDoc = gql`
  fragment FeedEntry on Entry {
    id
    commentCount
    repository {
      full_name
      html_url
      owner {
        avatar_url
      }
    }
    ...VoteButtons
    ...RepoInfo
  }
  ${VoteButtonsFragmentDoc}
  ${RepoInfoFragmentDoc}
`;
export const OnCommentAddedDocument = gql`
  subscription onCommentAdded($repoFullName: String!) {
    commentAdded(repoFullName: $repoFullName) {
      id
      postedBy {
        login
        html_url
      }
      createdAt
      content
    }
  }
`;

export function useOnCommentAddedSubscription<TData = OnCommentAddedSubscription>(
  options: Omit<Urql.UseSubscriptionArgs<OnCommentAddedSubscriptionVariables>, 'query'> = {},
  handler?: Urql.SubscriptionHandler<OnCommentAddedSubscription, TData>
) {
  return Urql.useSubscription<OnCommentAddedSubscription, TData, OnCommentAddedSubscriptionVariables>(
    { query: OnCommentAddedDocument, ...options },
    handler
  );
}
export const CommentDocument = gql`
  query Comment($repoFullName: String!, $limit: Int, $offset: Int) {
    currentUser {
      login
      html_url
    }
    entry(repoFullName: $repoFullName) {
      id
      postedBy {
        login
        html_url
      }
      createdAt
      comments(limit: $limit, offset: $offset) {
        ...CommentsPageComment
      }
      commentCount
      repository {
        full_name
        html_url
        ... on Repository {
          description
          open_issues_count
          stargazers_count
        }
      }
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

export function useCommentQuery(options: Omit<Urql.UseQueryArgs<CommentQueryVariables>, 'query'>) {
  return Urql.useQuery<CommentQuery>({ query: CommentDocument, ...options });
}
export const CurrentUserForProfileDocument = gql`
  query CurrentUserForProfile {
    currentUser {
      login
      avatar_url
    }
  }
`;

export function useCurrentUserForProfileQuery(
  options?: Omit<Urql.UseQueryArgs<CurrentUserForProfileQueryVariables>, 'query'>
) {
  return Urql.useQuery<CurrentUserForProfileQuery>({ query: CurrentUserForProfileDocument, ...options });
}
export const FeedDocument = gql`
  query Feed($type: FeedType!, $offset: Int, $limit: Int) {
    currentUser {
      login
    }
    feed(type: $type, offset: $offset, limit: $limit) {
      ...FeedEntry
    }
  }
  ${FeedEntryFragmentDoc}
`;

export function useFeedQuery(options: Omit<Urql.UseQueryArgs<FeedQueryVariables>, 'query'>) {
  return Urql.useQuery<FeedQuery>({ query: FeedDocument, ...options });
}
export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;

export function useSubmitRepositoryMutation() {
  return Urql.useMutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>(SubmitRepositoryDocument);
}
export const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

export function useSubmitCommentMutation() {
  return Urql.useMutation<SubmitCommentMutation, SubmitCommentMutationVariables>(SubmitCommentDocument);
}
export const VoteDocument = gql`
  mutation vote($repoFullName: String!, $type: VoteType!) {
    vote(repoFullName: $repoFullName, type: $type) {
      score
      id
      vote {
        vote_value
      }
    }
  }
`;

export function useVoteMutation() {
  return Urql.useMutation<VoteMutation, VoteMutationVariables>(VoteDocument);
}
import { IntrospectionQuery } from 'graphql';
export default {
  __schema: {
    queryType: {
      name: 'Query',
    },
    mutationType: {
      name: 'Mutation',
    },
    subscriptionType: {
      name: 'Subscription',
    },
    types: [
      {
        kind: 'OBJECT',
        name: 'Comment',
        fields: [
          {
            name: 'content',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'createdAt',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'id',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'postedBy',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'OBJECT',
                name: 'User',
                ofType: null,
              },
            },
            args: [],
          },
          {
            name: 'repoName',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: 'OBJECT',
        name: 'Entry',
        fields: [
          {
            name: 'commentCount',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'comments',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'LIST',
                ofType: {
                  kind: 'OBJECT',
                  name: 'Comment',
                  ofType: null,
                },
              },
            },
            args: [
              {
                name: 'limit',
                type: {
                  kind: 'SCALAR',
                  name: 'Any',
                },
              },
              {
                name: 'offset',
                type: {
                  kind: 'SCALAR',
                  name: 'Any',
                },
              },
            ],
          },
          {
            name: 'createdAt',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'hotScore',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'id',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'postedBy',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'OBJECT',
                name: 'User',
                ofType: null,
              },
            },
            args: [],
          },
          {
            name: 'repository',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'OBJECT',
                name: 'Repository',
                ofType: null,
              },
            },
            args: [],
          },
          {
            name: 'score',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'vote',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'OBJECT',
                name: 'Vote',
                ofType: null,
              },
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: 'OBJECT',
        name: 'Mutation',
        fields: [
          {
            name: 'submitComment',
            type: {
              kind: 'OBJECT',
              name: 'Comment',
              ofType: null,
            },
            args: [
              {
                name: 'commentContent',
                type: {
                  kind: 'NON_NULL',
                  ofType: {
                    kind: 'SCALAR',
                    name: 'Any',
                  },
                },
              },
              {
                name: 'repoFullName',
                type: {
                  kind: 'NON_NULL',
                  ofType: {
                    kind: 'SCALAR',
                    name: 'Any',
                  },
                },
              },
            ],
          },
          {
            name: 'submitRepository',
            type: {
              kind: 'OBJECT',
              name: 'Entry',
              ofType: null,
            },
            args: [
              {
                name: 'repoFullName',
                type: {
                  kind: 'NON_NULL',
                  ofType: {
                    kind: 'SCALAR',
                    name: 'Any',
                  },
                },
              },
            ],
          },
          {
            name: 'vote',
            type: {
              kind: 'OBJECT',
              name: 'Entry',
              ofType: null,
            },
            args: [
              {
                name: 'repoFullName',
                type: {
                  kind: 'NON_NULL',
                  ofType: {
                    kind: 'SCALAR',
                    name: 'Any',
                  },
                },
              },
              {
                name: 'type',
                type: {
                  kind: 'NON_NULL',
                  ofType: {
                    kind: 'SCALAR',
                    name: 'Any',
                  },
                },
              },
            ],
          },
        ],
        interfaces: [],
      },
      {
        kind: 'OBJECT',
        name: 'Query',
        fields: [
          {
            name: 'currentUser',
            type: {
              kind: 'OBJECT',
              name: 'User',
              ofType: null,
            },
            args: [],
          },
          {
            name: 'entry',
            type: {
              kind: 'OBJECT',
              name: 'Entry',
              ofType: null,
            },
            args: [
              {
                name: 'repoFullName',
                type: {
                  kind: 'NON_NULL',
                  ofType: {
                    kind: 'SCALAR',
                    name: 'Any',
                  },
                },
              },
            ],
          },
          {
            name: 'feed',
            type: {
              kind: 'LIST',
              ofType: {
                kind: 'OBJECT',
                name: 'Entry',
                ofType: null,
              },
            },
            args: [
              {
                name: 'limit',
                type: {
                  kind: 'SCALAR',
                  name: 'Any',
                },
              },
              {
                name: 'offset',
                type: {
                  kind: 'SCALAR',
                  name: 'Any',
                },
              },
              {
                name: 'type',
                type: {
                  kind: 'NON_NULL',
                  ofType: {
                    kind: 'SCALAR',
                    name: 'Any',
                  },
                },
              },
            ],
          },
        ],
        interfaces: [],
      },
      {
        kind: 'OBJECT',
        name: 'Repository',
        fields: [
          {
            name: 'description',
            type: {
              kind: 'SCALAR',
              name: 'Any',
            },
            args: [],
          },
          {
            name: 'full_name',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'html_url',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'name',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'open_issues_count',
            type: {
              kind: 'SCALAR',
              name: 'Any',
            },
            args: [],
          },
          {
            name: 'owner',
            type: {
              kind: 'OBJECT',
              name: 'User',
              ofType: null,
            },
            args: [],
          },
          {
            name: 'stargazers_count',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: 'OBJECT',
        name: 'Subscription',
        fields: [
          {
            name: 'commentAdded',
            type: {
              kind: 'OBJECT',
              name: 'Comment',
              ofType: null,
            },
            args: [
              {
                name: 'repoFullName',
                type: {
                  kind: 'NON_NULL',
                  ofType: {
                    kind: 'SCALAR',
                    name: 'Any',
                  },
                },
              },
            ],
          },
        ],
        interfaces: [],
      },
      {
        kind: 'OBJECT',
        name: 'User',
        fields: [
          {
            name: 'avatar_url',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'html_url',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
          {
            name: 'login',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: 'OBJECT',
        name: 'Vote',
        fields: [
          {
            name: 'vote_value',
            type: {
              kind: 'NON_NULL',
              ofType: {
                kind: 'SCALAR',
                name: 'Any',
              },
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: 'SCALAR',
        name: 'Any',
      },
    ],
    directives: [],
  },
} as unknown as IntrospectionQuery;
export type WithTypename<T extends { __typename?: any }> = Partial<T> & { __typename: NonNullable<T['__typename']> };

export type GraphCacheKeysConfig = {
  Comment?: (data: WithTypename<Comment>) => null | string;
  Entry?: (data: WithTypename<Entry>) => null | string;
  Repository?: (data: WithTypename<Repository>) => null | string;
  User?: (data: WithTypename<User>) => null | string;
  Vote?: (data: WithTypename<Vote>) => null | string;
};

export type GraphCacheResolvers = {
  Query?: {
    currentUser?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, WithTypename<User> | string>;
    entry?: GraphCacheResolver<WithTypename<Query>, QueryEntryArgs, WithTypename<Entry> | string>;
    feed?: GraphCacheResolver<WithTypename<Query>, QueryFeedArgs, Array<WithTypename<Entry> | string>>;
  };
  Comment?: {
    content?: GraphCacheResolver<WithTypename<Comment>, Record<string, never>, Scalars['String'] | string>;
    createdAt?: GraphCacheResolver<WithTypename<Comment>, Record<string, never>, Scalars['Float'] | string>;
    id?: GraphCacheResolver<WithTypename<Comment>, Record<string, never>, Scalars['Int'] | string>;
    postedBy?: GraphCacheResolver<WithTypename<Comment>, Record<string, never>, WithTypename<User> | string>;
    repoName?: GraphCacheResolver<WithTypename<Comment>, Record<string, never>, Scalars['String'] | string>;
  };
  Entry?: {
    commentCount?: GraphCacheResolver<WithTypename<Entry>, Record<string, never>, Scalars['Int'] | string>;
    comments?: GraphCacheResolver<WithTypename<Entry>, EntryCommentsArgs, Array<WithTypename<Comment> | string>>;
    createdAt?: GraphCacheResolver<WithTypename<Entry>, Record<string, never>, Scalars['Float'] | string>;
    hotScore?: GraphCacheResolver<WithTypename<Entry>, Record<string, never>, Scalars['Float'] | string>;
    id?: GraphCacheResolver<WithTypename<Entry>, Record<string, never>, Scalars['Int'] | string>;
    postedBy?: GraphCacheResolver<WithTypename<Entry>, Record<string, never>, WithTypename<User> | string>;
    repository?: GraphCacheResolver<WithTypename<Entry>, Record<string, never>, WithTypename<Repository> | string>;
    score?: GraphCacheResolver<WithTypename<Entry>, Record<string, never>, Scalars['Int'] | string>;
    vote?: GraphCacheResolver<WithTypename<Entry>, Record<string, never>, WithTypename<Vote> | string>;
  };
  Repository?: {
    description?: GraphCacheResolver<WithTypename<Repository>, Record<string, never>, Scalars['String'] | string>;
    full_name?: GraphCacheResolver<WithTypename<Repository>, Record<string, never>, Scalars['String'] | string>;
    html_url?: GraphCacheResolver<WithTypename<Repository>, Record<string, never>, Scalars['String'] | string>;
    name?: GraphCacheResolver<WithTypename<Repository>, Record<string, never>, Scalars['String'] | string>;
    open_issues_count?: GraphCacheResolver<WithTypename<Repository>, Record<string, never>, Scalars['Int'] | string>;
    owner?: GraphCacheResolver<WithTypename<Repository>, Record<string, never>, WithTypename<User> | string>;
    stargazers_count?: GraphCacheResolver<WithTypename<Repository>, Record<string, never>, Scalars['Int'] | string>;
  };
  User?: {
    avatar_url?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>;
    html_url?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>;
    login?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>;
  };
  Vote?: {
    vote_value?: GraphCacheResolver<WithTypename<Vote>, Record<string, never>, Scalars['Int'] | string>;
  };
};

export type GraphCacheOptimisticUpdaters = {
  submitComment?: GraphCacheOptimisticMutationResolver<MutationSubmitCommentArgs, Maybe<WithTypename<Comment>>>;
  submitRepository?: GraphCacheOptimisticMutationResolver<MutationSubmitRepositoryArgs, Maybe<WithTypename<Entry>>>;
  vote?: GraphCacheOptimisticMutationResolver<MutationVoteArgs, Maybe<WithTypename<Entry>>>;
};

export type GraphCacheUpdaters = {
  Mutation?: {
    submitComment?: GraphCacheUpdateResolver<
      { submitComment: Maybe<WithTypename<Comment>> },
      MutationSubmitCommentArgs
    >;
    submitRepository?: GraphCacheUpdateResolver<
      { submitRepository: Maybe<WithTypename<Entry>> },
      MutationSubmitRepositoryArgs
    >;
    vote?: GraphCacheUpdateResolver<{ vote: Maybe<WithTypename<Entry>> }, MutationVoteArgs>;
  };
  Subscription?: {
    commentAdded?: GraphCacheUpdateResolver<
      { commentAdded: Maybe<WithTypename<Comment>> },
      SubscriptionCommentAddedArgs
    >;
  };
};

export type GraphCacheConfig = {
  schema?: IntrospectionData;
  updates?: GraphCacheUpdaters;
  keys?: GraphCacheKeysConfig;
  optimistic?: GraphCacheOptimisticUpdaters;
  resolvers?: GraphCacheResolvers;
  storage?: GraphCacheStorageAdapter;
};
