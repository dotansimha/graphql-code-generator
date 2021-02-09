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

export type OnCommentAddedSubscription = {
  __typename?: 'Subscription';
  commentAdded?: Maybe<{
    __typename?: 'Comment';
    id: number;
    createdAt: number;
    content: string;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
  }>;
};

export type CommentQueryVariables = Exact<{
  repoFullName: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;

export type CommentQuery = {
  __typename?: 'Query';
  currentUser?: Maybe<{ __typename?: 'User'; login: string; html_url: string }>;
  entry?: Maybe<{
    __typename?: 'Entry';
    id: number;
    createdAt: number;
    commentCount: number;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
    comments: Array<Maybe<{ __typename?: 'Comment' } & CommentsPageCommentFragment>>;
    repository: {
      __typename?: 'Repository';
      description?: Maybe<string>;
      open_issues_count?: Maybe<number>;
      stargazers_count: number;
      full_name: string;
      html_url: string;
    };
  }>;
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
  currentUser?: Maybe<{ __typename?: 'User'; login: string; avatar_url: string }>;
};

export type FeedEntryFragment = {
  __typename?: 'Entry';
  id: number;
  commentCount: number;
  repository: {
    __typename?: 'Repository';
    full_name: string;
    html_url: string;
    owner?: Maybe<{ __typename?: 'User'; avatar_url: string }>;
  };
} & VoteButtonsFragment &
  RepoInfoFragment;

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
}>;

export type FeedQuery = {
  __typename?: 'Query';
  currentUser?: Maybe<{ __typename?: 'User'; login: string }>;
  feed?: Maybe<Array<Maybe<{ __typename?: 'Entry' } & FeedEntryFragment>>>;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type SubmitRepositoryMutation = {
  __typename?: 'Mutation';
  submitRepository?: Maybe<{ __typename?: 'Entry'; createdAt: number }>;
};

export type RepoInfoFragment = {
  __typename?: 'Entry';
  createdAt: number;
  repository: {
    __typename?: 'Repository';
    description?: Maybe<string>;
    stargazers_count: number;
    open_issues_count?: Maybe<number>;
  };
  postedBy: { __typename?: 'User'; html_url: string; login: string };
};

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
}>;

export type SubmitCommentMutation = {
  __typename?: 'Mutation';
  submitComment?: Maybe<{ __typename?: 'Comment' } & CommentsPageCommentFragment>;
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
  vote?: Maybe<{ __typename?: 'Entry'; score: number; id: number; vote: { __typename?: 'Vote'; vote_value: number } }>;
};

export namespace OnCommentAdded {
  export type Variables = OnCommentAddedSubscriptionVariables;
  export type Subscription = OnCommentAddedSubscription;
  export type CommentAdded = NonNullable<OnCommentAddedSubscription['commentAdded']>;
  export type PostedBy = NonNullable<NonNullable<OnCommentAddedSubscription['commentAdded']>['postedBy']>;
}

export namespace Comment {
  export type Variables = CommentQueryVariables;
  export type Query = CommentQuery;
  export type CurrentUser = NonNullable<CommentQuery['currentUser']>;
  export type Entry = NonNullable<CommentQuery['entry']>;
  export type PostedBy = NonNullable<NonNullable<CommentQuery['entry']>['postedBy']>;
  export type Comments = NonNullable<NonNullable<NonNullable<CommentQuery['entry']>['comments']>[number]>;
  export type Repository = NonNullable<NonNullable<CommentQuery['entry']>['repository']>;
  export type RepositoryInlineFragment = { __typename: 'Repository' } & Pick<
    NonNullable<NonNullable<CommentQuery['entry']>['repository']>,
    'description' | 'open_issues_count' | 'stargazers_count'
  >;
}

export namespace CommentsPageComment {
  export type Fragment = CommentsPageCommentFragment;
  export type PostedBy = NonNullable<CommentsPageCommentFragment['postedBy']>;
}

export namespace CurrentUserForProfile {
  export type Variables = CurrentUserForProfileQueryVariables;
  export type Query = CurrentUserForProfileQuery;
  export type CurrentUser = NonNullable<CurrentUserForProfileQuery['currentUser']>;
}

export namespace FeedEntry {
  export type Fragment = FeedEntryFragment;
  export type Repository = NonNullable<FeedEntryFragment['repository']>;
  export type Owner = NonNullable<NonNullable<FeedEntryFragment['repository']>['owner']>;
}

export namespace Feed {
  export type Variables = FeedQueryVariables;
  export type Query = FeedQuery;
  export type CurrentUser = NonNullable<FeedQuery['currentUser']>;
  export type Feed = NonNullable<NonNullable<FeedQuery['feed']>[number]>;
}

export namespace SubmitRepository {
  export type Variables = SubmitRepositoryMutationVariables;
  export type Mutation = SubmitRepositoryMutation;
  export type SubmitRepository = NonNullable<SubmitRepositoryMutation['submitRepository']>;
}

export namespace RepoInfo {
  export type Fragment = RepoInfoFragment;
  export type Repository = NonNullable<RepoInfoFragment['repository']>;
  export type PostedBy = NonNullable<RepoInfoFragment['postedBy']>;
}

export namespace SubmitComment {
  export type Variables = SubmitCommentMutationVariables;
  export type Mutation = SubmitCommentMutation;
  export type SubmitComment = NonNullable<SubmitCommentMutation['submitComment']>;
}

export namespace VoteButtons {
  export type Fragment = VoteButtonsFragment;
  export type Vote = NonNullable<VoteButtonsFragment['vote']>;
}

export namespace Vote {
  export type Variables = VoteMutationVariables;
  export type Mutation = VoteMutation;
  export type Vote = NonNullable<VoteMutation['vote']>;
  export type _Vote = NonNullable<NonNullable<VoteMutation['vote']>['vote']>;
}
