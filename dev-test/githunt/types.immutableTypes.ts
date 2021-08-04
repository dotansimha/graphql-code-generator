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

/** Type overrides using directives */
export type Directives = {};

/** A comment about an entry, submitted by a user */
export type Comment = {
  readonly __typename?: 'Comment';
  /** The SQL ID of this entry */
  readonly id: Scalars['Int'];
  /** The GitHub user who posted the comment */
  readonly postedBy: User;
  /** A timestamp of when the comment was posted */
  readonly createdAt: Scalars['Float'];
  /** The text of the comment */
  readonly content: Scalars['String'];
  /** The repository which this comment is about */
  readonly repoName: Scalars['String'];
};

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {
  readonly __typename?: 'Entry';
  /** Information about the repository from GitHub */
  readonly repository: Repository;
  /** The GitHub user who submitted this entry */
  readonly postedBy: User;
  /** A timestamp of when the entry was submitted */
  readonly createdAt: Scalars['Float'];
  /** The score of this repository, upvotes - downvotes */
  readonly score: Scalars['Int'];
  /** The hot score of this repository */
  readonly hotScore: Scalars['Float'];
  /** Comments posted about this repository */
  readonly comments: ReadonlyArray<Maybe<Comment>>;
  /** The number of comments posted about this repository */
  readonly commentCount: Scalars['Int'];
  /** The SQL ID of this entry */
  readonly id: Scalars['Int'];
  /** XXX to be changed */
  readonly vote: Vote;
};

/** Information about a GitHub repository submitted to GitHunt */
export type EntryCommentsArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
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
  readonly __typename?: 'Mutation';
  /** Submit a new repository, returns the new submission */
  readonly submitRepository?: Maybe<Entry>;
  /** Vote on a repository submission, returns the submission that was voted on */
  readonly vote?: Maybe<Entry>;
  /** Comment on a repository, returns the new comment */
  readonly submitComment?: Maybe<Comment>;
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

export type Query = {
  readonly __typename?: 'Query';
  /** A feed of repository submissions */
  readonly feed?: Maybe<ReadonlyArray<Maybe<Entry>>>;
  /** A single entry */
  readonly entry?: Maybe<Entry>;
  /** Return the currently logged in user, or null if nobody is logged in */
  readonly currentUser?: Maybe<User>;
};

export type QueryFeedArgs = {
  type: FeedType;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};

export type QueryEntryArgs = {
  repoFullName: Scalars['String'];
};

/**
 * A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 */
export type Repository = {
  readonly __typename?: 'Repository';
  /** Just the name of the repository, e.g. GitHunt-API */
  readonly name: Scalars['String'];
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  readonly full_name: Scalars['String'];
  /** The description of the repository */
  readonly description?: Maybe<Scalars['String']>;
  /** The link to the repository on GitHub */
  readonly html_url: Scalars['String'];
  /** The number of people who have starred this repository on GitHub */
  readonly stargazers_count: Scalars['Int'];
  /** The number of open issues on this repository on GitHub */
  readonly open_issues_count?: Maybe<Scalars['Int']>;
  /** The owner of this repository on GitHub, e.g. apollostack */
  readonly owner?: Maybe<User>;
};

export type Subscription = {
  readonly __typename?: 'Subscription';
  /** Subscription fires on every comment added */
  readonly commentAdded?: Maybe<Comment>;
};

export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String'];
};

/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export type User = {
  readonly __typename?: 'User';
  /** The name of the user, e.g. apollostack */
  readonly login: Scalars['String'];
  /** The URL to a directly embeddable image for this user's avatar */
  readonly avatar_url: Scalars['String'];
  /** The URL of this user's GitHub page */
  readonly html_url: Scalars['String'];
};

/** XXX to be removed */
export type Vote = {
  readonly __typename?: 'Vote';
  readonly vote_value: Scalars['Int'];
};

/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL',
}

export type OnCommentAddedSubscriptionVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type OnCommentAddedSubscription = {
  readonly __typename?: 'Subscription';
  readonly commentAdded?: Maybe<{
    readonly __typename?: 'Comment';
    readonly id: number;
    readonly createdAt: number;
    readonly content: string;
    readonly postedBy: { readonly __typename?: 'User'; readonly login: string; readonly html_url: string };
  }>;
};

export type CommentQueryVariables = Exact<{
  repoFullName: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;

export type CommentQuery = {
  readonly __typename?: 'Query';
  readonly currentUser?: Maybe<{ readonly __typename?: 'User'; readonly login: string; readonly html_url: string }>;
  readonly entry?: Maybe<{
    readonly __typename?: 'Entry';
    readonly id: number;
    readonly createdAt: number;
    readonly commentCount: number;
    readonly postedBy: { readonly __typename?: 'User'; readonly login: string; readonly html_url: string };
    readonly comments: ReadonlyArray<
      Maybe<{
        readonly __typename?: 'Comment';
        readonly id: number;
        readonly createdAt: number;
        readonly content: string;
        readonly postedBy: { readonly __typename?: 'User'; readonly login: string; readonly html_url: string };
      }>
    >;
    readonly repository: {
      readonly __typename?: 'Repository';
      readonly description?: Maybe<string>;
      readonly open_issues_count?: Maybe<number>;
      readonly stargazers_count: number;
      readonly full_name: string;
      readonly html_url: string;
    };
  }>;
};

export type CommentsPageCommentFragment = {
  readonly __typename?: 'Comment';
  readonly id: number;
  readonly createdAt: number;
  readonly content: string;
  readonly postedBy: { readonly __typename?: 'User'; readonly login: string; readonly html_url: string };
};

export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserForProfileQuery = {
  readonly __typename?: 'Query';
  readonly currentUser?: Maybe<{ readonly __typename?: 'User'; readonly login: string; readonly avatar_url: string }>;
};

export type FeedEntryFragment = {
  readonly __typename?: 'Entry';
  readonly id: number;
  readonly commentCount: number;
  readonly score: number;
  readonly createdAt: number;
  readonly repository: {
    readonly __typename?: 'Repository';
    readonly full_name: string;
    readonly html_url: string;
    readonly description?: Maybe<string>;
    readonly stargazers_count: number;
    readonly open_issues_count?: Maybe<number>;
    readonly owner?: Maybe<{ readonly __typename?: 'User'; readonly avatar_url: string }>;
  };
  readonly vote: { readonly __typename?: 'Vote'; readonly vote_value: number };
  readonly postedBy: { readonly __typename?: 'User'; readonly html_url: string; readonly login: string };
};

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
}>;

export type FeedQuery = {
  readonly __typename?: 'Query';
  readonly currentUser?: Maybe<{ readonly __typename?: 'User'; readonly login: string }>;
  readonly feed?: Maybe<
    ReadonlyArray<
      Maybe<{
        readonly __typename?: 'Entry';
        readonly id: number;
        readonly commentCount: number;
        readonly score: number;
        readonly createdAt: number;
        readonly repository: {
          readonly __typename?: 'Repository';
          readonly full_name: string;
          readonly html_url: string;
          readonly description?: Maybe<string>;
          readonly stargazers_count: number;
          readonly open_issues_count?: Maybe<number>;
          readonly owner?: Maybe<{ readonly __typename?: 'User'; readonly avatar_url: string }>;
        };
        readonly vote: { readonly __typename?: 'Vote'; readonly vote_value: number };
        readonly postedBy: { readonly __typename?: 'User'; readonly html_url: string; readonly login: string };
      }>
    >
  >;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type SubmitRepositoryMutation = {
  readonly __typename?: 'Mutation';
  readonly submitRepository?: Maybe<{ readonly __typename?: 'Entry'; readonly createdAt: number }>;
};

export type RepoInfoFragment = {
  readonly __typename?: 'Entry';
  readonly createdAt: number;
  readonly repository: {
    readonly __typename?: 'Repository';
    readonly description?: Maybe<string>;
    readonly stargazers_count: number;
    readonly open_issues_count?: Maybe<number>;
  };
  readonly postedBy: { readonly __typename?: 'User'; readonly html_url: string; readonly login: string };
};

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
}>;

export type SubmitCommentMutation = {
  readonly __typename?: 'Mutation';
  readonly submitComment?: Maybe<{
    readonly __typename?: 'Comment';
    readonly id: number;
    readonly createdAt: number;
    readonly content: string;
    readonly postedBy: { readonly __typename?: 'User'; readonly login: string; readonly html_url: string };
  }>;
};

export type VoteButtonsFragment = {
  readonly __typename?: 'Entry';
  readonly score: number;
  readonly vote: { readonly __typename?: 'Vote'; readonly vote_value: number };
};

export type VoteMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  type: VoteType;
}>;

export type VoteMutation = {
  readonly __typename?: 'Mutation';
  readonly vote?: Maybe<{
    readonly __typename?: 'Entry';
    readonly score: number;
    readonly id: number;
    readonly vote: { readonly __typename?: 'Vote'; readonly vote_value: number };
  }>;
};
