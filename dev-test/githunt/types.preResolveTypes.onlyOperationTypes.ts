export type Maybe<T> = T | null;
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
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
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
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
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
