export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

/** A comment about an entry, submitted by a user */
export type Comment = {
  __typename?: 'Comment',
  /** The SQL ID of this entry */
  readonly id: Scalars['Int'],
  /** The GitHub user who posted the comment */
  readonly postedBy: User,
  /** A timestamp of when the comment was posted */
  readonly createdAt: Scalars['Float'],
  /** The text of the comment */
  readonly content: Scalars['String'],
  /** The repository which this comment is about */
  readonly repoName: Scalars['String'],
};

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {
  __typename?: 'Entry',
  /** Information about the repository from GitHub */
  readonly repository: Repository,
  /** The GitHub user who submitted this entry */
  readonly postedBy: User,
  /** A timestamp of when the entry was submitted */
  readonly createdAt: Scalars['Float'],
  /** The score of this repository, upvotes - downvotes */
  readonly score: Scalars['Int'],
  /** The hot score of this repository */
  readonly hotScore: Scalars['Float'],
  /** Comments posted about this repository */
  readonly comments: ReadonlyArray<Maybe<Comment>>,
  /** The number of comments posted about this repository */
  readonly commentCount: Scalars['Int'],
  /** The SQL ID of this entry */
  readonly id: Scalars['Int'],
  /** XXX to be changed */
  readonly vote: Vote,
};


/** Information about a GitHub repository submitted to GitHunt */
export type EntryCommentsArgs = {
  limit?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
};

/** A list of options for the sort order of the feed */
export enum FeedType {
  /** Sort by a combination of freshness and score, using Reddit's algorithm */
  Hot = 'HOT',
  /** Newest entries first */
  New = 'NEW',
  /** Highest score entries first */
  Top = 'TOP'
}

export type Mutation = {
  __typename?: 'Mutation',
  /** Submit a new repository, returns the new submission */
  readonly submitRepository?: Maybe<Entry>,
  /** Vote on a repository submission, returns the submission that was voted on */
  readonly vote?: Maybe<Entry>,
  /** Comment on a repository, returns the new comment */
  readonly submitComment?: Maybe<Comment>,
};


export type MutationSubmitRepositoryArgs = {
  repoFullName: Scalars['String']
};


export type MutationVoteArgs = {
  repoFullName: Scalars['String'],
  type: VoteType
};


export type MutationSubmitCommentArgs = {
  repoFullName: Scalars['String'],
  commentContent: Scalars['String']
};

export type Query = {
  __typename?: 'Query',
  /** A feed of repository submissions */
  readonly feed?: Maybe<ReadonlyArray<Maybe<Entry>>>,
  /** A single entry */
  readonly entry?: Maybe<Entry>,
  /** Return the currently logged in user, or null if nobody is logged in */
  readonly currentUser?: Maybe<User>,
};


export type QueryFeedArgs = {
  type: FeedType,
  offset?: Maybe<Scalars['Int']>,
  limit?: Maybe<Scalars['Int']>
};


export type QueryEntryArgs = {
  repoFullName: Scalars['String']
};

/** 
 * A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 **/
export type Repository = {
  __typename?: 'Repository',
  /** Just the name of the repository, e.g. GitHunt-API */
  readonly name: Scalars['String'],
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  readonly full_name: Scalars['String'],
  /** The description of the repository */
  readonly description?: Maybe<Scalars['String']>,
  /** The link to the repository on GitHub */
  readonly html_url: Scalars['String'],
  /** The number of people who have starred this repository on GitHub */
  readonly stargazers_count: Scalars['Int'],
  /** The number of open issues on this repository on GitHub */
  readonly open_issues_count?: Maybe<Scalars['Int']>,
  /** The owner of this repository on GitHub, e.g. apollostack */
  readonly owner?: Maybe<User>,
};

export type Subscription = {
  __typename?: 'Subscription',
  /** Subscription fires on every comment added */
  readonly commentAdded?: Maybe<Comment>,
};


export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String']
};

/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export type User = {
  __typename?: 'User',
  /** The name of the user, e.g. apollostack */
  readonly login: Scalars['String'],
  /** The URL to a directly embeddable image for this user's avatar */
  readonly avatar_url: Scalars['String'],
  /** The URL of this user's GitHub page */
  readonly html_url: Scalars['String'],
};

/** XXX to be removed */
export type Vote = {
  __typename?: 'Vote',
  readonly vote_value: Scalars['Int'],
};

/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL'
}
export type OnCommentAddedSubscriptionVariables = {
  repoFullName: Scalars['String']
};


export type OnCommentAddedSubscription = ({ readonly __typename?: 'Subscription' } & { readonly commentAdded: Maybe<({ readonly __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) })> });

export type CommentQueryVariables = {
  repoFullName: Scalars['String'],
  limit?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
};


export type CommentQuery = ({ readonly __typename?: 'Query' } & { readonly currentUser: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>)>, readonly entry: Maybe<({ readonly __typename?: 'Entry' } & Pick<Entry, 'id' | 'createdAt' | 'commentCount'> & { readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>), readonly comments: ReadonlyArray<Maybe<({ readonly __typename?: 'Comment' } & CommentsPageCommentFragment)>>, readonly repository: ({ readonly __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & ({ readonly __typename?: 'Repository' } & Pick<Repository, 'description' | 'open_issues_count' | 'stargazers_count'>)) })> });

export type CommentsPageCommentFragment = ({ readonly __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) });

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ readonly __typename?: 'Query' } & { readonly currentUser: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'login' | 'avatar_url'>)> });

export type FeedEntryFragment = ({ readonly __typename?: 'Entry' } & Pick<Entry, 'id' | 'commentCount'> & { readonly repository: ({ readonly __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & { readonly owner: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'avatar_url'>)> }) } & (VoteButtonsFragment & RepoInfoFragment));

export type FeedQueryVariables = {
  type: FeedType,
  offset?: Maybe<Scalars['Int']>,
  limit?: Maybe<Scalars['Int']>
};


export type FeedQuery = ({ readonly __typename?: 'Query' } & { readonly currentUser: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'login'>)>, readonly feed: Maybe<ReadonlyArray<Maybe<({ readonly __typename?: 'Entry' } & FeedEntryFragment)>>> });

export type SubmitRepositoryMutationVariables = {
  repoFullName: Scalars['String']
};


export type SubmitRepositoryMutation = ({ readonly __typename?: 'Mutation' } & { readonly submitRepository: Maybe<({ readonly __typename?: 'Entry' } & Pick<Entry, 'createdAt'>)> });

export type RepoInfoFragment = ({ readonly __typename?: 'Entry' } & Pick<Entry, 'createdAt'> & { readonly repository: ({ readonly __typename?: 'Repository' } & Pick<Repository, 'description' | 'stargazers_count' | 'open_issues_count'>), readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'html_url' | 'login'>) });

export type SubmitCommentMutationVariables = {
  repoFullName: Scalars['String'],
  commentContent: Scalars['String']
};


export type SubmitCommentMutation = ({ readonly __typename?: 'Mutation' } & { readonly submitComment: Maybe<({ readonly __typename?: 'Comment' } & CommentsPageCommentFragment)> });

export type VoteButtonsFragment = ({ readonly __typename?: 'Entry' } & Pick<Entry, 'score'> & { readonly vote: ({ readonly __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) });

export type VoteMutationVariables = {
  repoFullName: Scalars['String'],
  type: VoteType
};


export type VoteMutation = ({ readonly __typename?: 'Mutation' } & { readonly vote: Maybe<({ readonly __typename?: 'Entry' } & Pick<Entry, 'score' | 'id'> & { readonly vote: ({ readonly __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) })> });
