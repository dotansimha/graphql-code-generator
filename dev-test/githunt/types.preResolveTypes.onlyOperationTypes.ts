export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Empty<T> = { [P in keyof T]?: never };
export type Incremental<T> = T & { ' $defer': true };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
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
