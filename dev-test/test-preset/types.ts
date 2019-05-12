
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
  /** The SQL ID of this entry */
  id: Scalars['Int'],
  /** The GitHub user who posted the comment */
  postedBy: User,
  /** A timestamp of when the comment was posted */
  createdAt: Scalars['Float'],
  /** The text of the comment */
  content: Scalars['String'],
  /** The repository which this comment is about */
  repoName: Scalars['String'],
};

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {
  /** Information about the repository from GitHub */
  repository: Repository,
  /** The GitHub user who submitted this entry */
  postedBy: User,
  /** A timestamp of when the entry was submitted */
  createdAt: Scalars['Float'],
  /** The score of this repository, upvotes - downvotes */
  score: Scalars['Int'],
  /** The hot score of this repository */
  hotScore: Scalars['Float'],
  /** Comments posted about this repository */
  comments: Array<Maybe<Comment>>,
  /** The number of comments posted about this repository */
  commentCount: Scalars['Int'],
  /** The SQL ID of this entry */
  id: Scalars['Int'],
  /** XXX to be changed */
  vote: Vote,
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
  /** Submit a new repository, returns the new submission */
  submitRepository?: Maybe<Entry>,
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: Maybe<Entry>,
  /** Comment on a repository, returns the new comment */
  submitComment?: Maybe<Comment>,
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
  /** A feed of repository submissions */
  feed?: Maybe<Array<Maybe<Entry>>>,
  /** A single entry */
  entry?: Maybe<Entry>,
  /** Return the currently logged in user, or null if nobody is logged in */
  currentUser?: Maybe<User>,
};


export type QueryFeedArgs = {
  type: FeedType,
  offset?: Maybe<Scalars['Int']>,
  limit?: Maybe<Scalars['Int']>
};


export type QueryEntryArgs = {
  repoFullName: Scalars['String']
};

/** A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 */
export type Repository = {
  /** Just the name of the repository, e.g. GitHunt-API */
  name: Scalars['String'],
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: Scalars['String'],
  /** The description of the repository */
  description?: Maybe<Scalars['String']>,
  /** The link to the repository on GitHub */
  html_url: Scalars['String'],
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: Scalars['Int'],
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: Maybe<Scalars['Int']>,
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: Maybe<User>,
};

export type Subscription = {
  /** Subscription fires on every comment added */
  commentAdded?: Maybe<Comment>,
};


export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String']
};

/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export type User = {
  /** The name of the user, e.g. apollostack */
  login: Scalars['String'],
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: Scalars['String'],
  /** The URL of this user's GitHub page */
  html_url: Scalars['String'],
};

/** XXX to be removed */
export type Vote = {
  vote_value: Scalars['Int'],
};

/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL'
}
